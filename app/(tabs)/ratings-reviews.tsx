// Copyright © Knoux. All rights reserved.
/**
 * ⭐ Ratings & Reviews
 * ✅ FIXED: tRPC الحقيقي — لا RatingsReviewsService وهمي — لا user_123
 */

import { ScrollView, Text, View, Pressable, TextInput, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useLanguage } from "@/lib/language-context";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";

export default function RatingsReviewsScreen() {
  const { language } = useLanguage();
  const ar = language === "ar";
  const { user } = useAuth();

  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // ─── tRPC Queries ─────────────────────────────────────────────────────────
  const { data: reviews = [], isLoading: loadingReviews, refetch } = trpc.ratings.list.useQuery({ limit: 30 });
  const { data: stats } = trpc.ratings.stats.useQuery();

  // ─── tRPC Mutations ───────────────────────────────────────────────────────
  const submitMutation = trpc.ratings.submit.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedRating(0);
      setReviewComment("");
      setShowReviewForm(false);
      Alert.alert(
        ar ? "✅ شكراً!" : "✅ Thank you!",
        ar ? "تم إرسال تقييمك بنجاح" : "Your review has been submitted"
      );
    },
    onError: (err) => Alert.alert(ar ? "خطأ" : "Error", err.message),
  });

  const handleSubmit = () => {
    if (!user) {
      Alert.alert(
        ar ? "تسجيل الدخول مطلوب" : "Sign in required",
        ar ? "يرجى تسجيل الدخول لإرسال تقييم" : "Please sign in to submit a review"
      );
      return;
    }
    if (selectedRating === 0) {
      Alert.alert(ar ? "خطأ" : "Error", ar ? "يرجى اختيار تقييم من 1-5" : "Please select a rating (1-5)");
      return;
    }
    submitMutation.mutate({
      rating: selectedRating,
      comment: reviewComment.trim() || undefined,
    });
  };

  // ─── احتساب الإحصاءات ────────────────────────────────────────────────────
  const avgRating = stats?.average ?? 0;
  const totalReviews = stats?.total ?? 0;

  // توزيع النجوم من الـ reviews المحلية
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r: any) => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating]++;
  });

  const renderStars = (count: number, size = 18, filled = true) =>
    [1, 2, 3, 4, 5].map((i) => (
      <Text
        key={i}
        style={{ fontSize: size, color: i <= count ? "#A78BFA" : "rgba(255,255,255,0.15)" }}
      >★</Text>
    ));

  return (
    <ScreenContainer className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "900", color: "#F3F4F6" }}>
            {ar ? "⭐ التقييمات والمراجعات" : "⭐ Ratings & Reviews"}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 13, marginTop: 4 }}>
            {ar ? "آراء المستخدمين الحقيقيين" : "Real user feedback"}
          </Text>
        </View>

        {/* Overall Rating Card */}
        <View style={{
          backgroundColor: "rgba(167,139,250,0.08)", borderRadius: 20, padding: 20,
          borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", marginBottom: 20,
        }}>
          <View style={{ flexDirection: ar ? "row-reverse" : "row", alignItems: "center", gap: 20 }}>
            {/* الرقم الكبير */}
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 52, fontWeight: "900", color: "#A78BFA", lineHeight: 56 }}>
                {Number(avgRating).toFixed(1)}
              </Text>
              <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                {renderStars(Math.round(Number(avgRating)))}
              </View>
              <Text style={{ color: "#6B7280", fontSize: 11, marginTop: 4 }}>
                {ar ? `${totalReviews} تقييم` : `${totalReviews} reviews`}
              </Text>
            </View>

            {/* أشرطة التوزيع */}
            <View style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars] ?? 0;
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <View key={stars} style={{ flexDirection: ar ? "row-reverse" : "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <Text style={{ color: "#9CA3AF", fontSize: 11, width: 16, textAlign: "center" }}>{stars}</Text>
                    <Text style={{ color: "#A78BFA", fontSize: 11 }}>★</Text>
                    <View style={{ flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: "#A78BFA", borderRadius: 3 }} />
                    </View>
                    <Text style={{ color: "#6B7280", fontSize: 10, width: 20, textAlign: "right" }}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Write Review Button */}
        {!showReviewForm && (
          <Pressable
            onPress={() => setShowReviewForm(true)}
            style={{
              backgroundColor: "#A78BFA", borderRadius: 14, padding: 14,
              alignItems: "center", marginBottom: 20,
            }}
          >
            <Text style={{ color: "#000", fontSize: 15, fontWeight: "800" }}>
              {ar ? "✍️ اكتب تقييماً" : "✍️ Write a Review"}
            </Text>
          </Pressable>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 20,
            borderWidth: 1, borderColor: "rgba(167,139,250,0.2)", marginBottom: 20,
          }}>
            <Text style={{ color: "#F3F4F6", fontSize: 16, fontWeight: "800", marginBottom: 16 }}>
              {ar ? "شارك تجربتك" : "Share Your Experience"}
            </Text>

            {/* Star Selector */}
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>
              {ar ? "التقييم" : "Rating"}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable
                  key={star}
                  onPress={() => setSelectedRating(star)}
                  style={{ padding: 4 }}
                >
                  <Text style={{ fontSize: 36, color: star <= selectedRating ? "#A78BFA" : "rgba(255,255,255,0.15)" }}>
                    ★
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Comment */}
            <Text style={{ color: "#9CA3AF", fontSize: 12, marginBottom: 8 }}>
              {ar ? "التعليق (اختياري)" : "Comment (optional)"}
            </Text>
            <TextInput
              placeholder={ar ? "شارك تجربتك التفصيلية..." : "Share your detailed experience..."}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 14,
                color: "#E5E7EB", fontSize: 14, minHeight: 100, textAlignVertical: "top",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginBottom: 16,
              }}
              placeholderTextColor="#4B5563"
            />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => setShowReviewForm(false)}
                style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 12, padding: 12, alignItems: "center" }}
              >
                <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>{ar ? "إلغاء" : "Cancel"}</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={submitMutation.isPending}
                style={{
                  flex: 2, backgroundColor: "#A78BFA", borderRadius: 12, padding: 12,
                  alignItems: "center", opacity: submitMutation.isPending ? 0.7 : 1,
                }}
              >
                {submitMutation.isPending ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={{ color: "#000", fontWeight: "800" }}>
                    {ar ? "إرسال التقييم" : "Submit Review"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Reviews List */}
        <Text style={{ color: "#F3F4F6", fontSize: 16, fontWeight: "800", marginBottom: 12 }}>
          {ar ? "أحدث التقييمات" : "Recent Reviews"}
        </Text>

        {loadingReviews ? (
          <ActivityIndicator size="large" color="#A78BFA" style={{ marginTop: 20 }} />
        ) : reviews.length === 0 ? (
          <View style={{
            backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 20, padding: 40,
            alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
          }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>⭐</Text>
            <Text style={{ color: "#9CA3AF", textAlign: "center" }}>
              {ar ? "لا توجد تقييمات بعد\nكن أول من يقيّم!" : "No reviews yet\nBe the first to review!"}
            </Text>
          </View>
        ) : (
          reviews.map((review: any) => (
            <View key={review.id} style={{
              backgroundColor: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", marginBottom: 12,
            }}>
              {/* Header */}
              <View style={{ flexDirection: ar ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <View>
                  <Text style={{ color: "#F3F4F6", fontWeight: "700", fontSize: 14 }}>
                    {ar ? "مستخدم" : "User"} #{review.userId}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 2, marginTop: 4 }}>
                    {renderStars(review.rating, 14)}
                  </View>
                </View>
                <Text style={{ color: "#6B7280", fontSize: 11 }}>
                  {new Date(review.createdAt).toLocaleDateString(ar ? "ar-SA" : "en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </Text>
              </View>

              {/* Comment */}
              {review.comment && (
                <Text style={{ color: "#D1D5DB", fontSize: 13, lineHeight: 20 }}>
                  {review.comment}
                </Text>
              )}

              {/* Helpful counter */}
              {review.helpful > 0 && (
                <View style={{ flexDirection: ar ? "row-reverse" : "row", marginTop: 10, gap: 4, alignItems: "center" }}>
                  <Text style={{ color: "#6B7280", fontSize: 11 }}>
                    👍 {review.helpful} {ar ? "مفيد" : "helpful"}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

      </ScrollView>
    </ScreenContainer>
  );
}
