// Copyright © Knoux. All rights reserved.
import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  Platform,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface SearchResult {
  id: string;
  name: string;
  type: "video" | "audio" | "image";
  size: string;
  duration?: string;
  icon: string;
}

const ALL_MEDIA: SearchResult[] = [
  { id: "1", name: "Action Movie 4K.mp4", type: "video", size: "2.5 GB", duration: "2:34:15", icon: "🎬" },
  { id: "2", name: "Documentary HDR.mkv", type: "video", size: "1.8 GB", duration: "1:45:30", icon: "🎥" },
  { id: "3", name: "Travel Vlog.mp4", type: "video", size: "890 MB", duration: "0:45:12", icon: "✈️" },
  { id: "4", name: "Podcast Episode 45.mp3", type: "audio", size: "185 MB", duration: "1:23:45", icon: "🎙️" },
  { id: "5", name: "Music Album - Best Hits.flac", type: "audio", size: "520 MB", duration: "1:12:00", icon: "🎵" },
  { id: "6", name: "Meditation Sounds.mp3", type: "audio", size: "95 MB", duration: "0:58:30", icon: "🧘" },
  { id: "7", name: "Vacation Photos 2024.jpg", type: "image", size: "4.2 MB", icon: "📷" },
  { id: "8", name: "Family Portrait.png", type: "image", size: "8.1 MB", icon: "👨‍👩‍👧" },
  { id: "9", name: "Sunrise Timelapse.mp4", type: "video", size: "340 MB", duration: "0:03:45", icon: "🌅" },
  { id: "10", name: "Jazz Collection.flac", type: "audio", size: "1.2 GB", duration: "2:10:00", icon: "🎷" },
  { id: "11", name: "Architecture Photos.zip", type: "image", size: "120 MB", icon: "🏛️" },
  { id: "12", name: "Concert Live.mkv", type: "video", size: "6.5 GB", duration: "3:02:00", icon: "🎤" },
];

const RECENT_SEARCHES = ["4K movies", "jazz", "vacation", "podcast"];

const FILTER_TYPES = ["all", "video", "audio", "image"] as const;
type FilterType = (typeof FILTER_TYPES)[number];

const TYPE_ICON: Record<string, string> = { video: "🎬", audio: "🎵", image: "📷", all: "🔍" };
const TYPE_COLOR: Record<string, string> = {
  video: "#00C2FF",
  audio: "#8A2BE2",
  image: "#22C55E",
  all: "#F59E0B",
};

export default function SearchScreen() {
  const colors = useColors();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [recentSearches, setRecentSearches] = useState(RECENT_SEARCHES);

  const results = query.trim()
    ? ALL_MEDIA.filter((item) => {
        const matchName = item.name.toLowerCase().includes(query.toLowerCase());
        const matchType = filterType === "all" || item.type === filterType;
        return matchName && matchType;
      })
    : [];

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed && !recentSearches.includes(trimmed)) {
      setRecentSearches((prev) => [trimmed, ...prev.slice(0, 7)]);
    }
    Keyboard.dismiss();
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleResultPress = (item: SearchResult) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!recentSearches.includes(query.trim()) && query.trim()) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 7)]);
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => {
    const color = TYPE_COLOR[item.type];
    return (
      <Pressable
        onPress={() => handleResultPress(item)}
        style={({ pressed }) => [
          styles.resultCard,
          { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <View style={[styles.resultIconBox, { backgroundColor: color + "20" }]}>
          <Text style={{ fontSize: 22 }}>{item.icon}</Text>
        </View>
        <View style={styles.resultInfo}>
          <Text style={[styles.resultName, { color: colors.foreground }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.resultMeta, { color: colors.muted }]}>
            {item.type.toUpperCase()} • {item.size}
            {item.duration ? ` • ${item.duration}` : ""}
          </Text>
        </View>
        <View style={[styles.typeTag, { backgroundColor: color + "20" }]}>
          <Text style={[styles.typeTagText, { color }]}>{item.type}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={[styles.backText, { color: colors.primary }]}>←</Text>
        </Pressable>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ fontSize: 16, color: colors.muted }}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search media..."
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={clearQuery} style={{ padding: 4 }}>
              <Text style={{ fontSize: 16, color: colors.muted }}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.filterBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTER_TYPES.map((type) => {
          const active = filterType === type;
          const color = TYPE_COLOR[type];
          return (
            <Pressable
              key={type}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterType(type);
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? color : color + "18",
                  borderColor: color,
                },
              ]}
            >
              <Text style={{ fontSize: 13 }}>{TYPE_ICON[type]}</Text>
              <Text style={[styles.filterLabel, { color: active ? "#fff" : color }]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {query.length === 0 ? (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Searches</Text>
                <Pressable onPress={() => setRecentSearches([])}>
                  <Text style={[styles.clearLink, { color: colors.error }]}>Clear</Text>
                </Pressable>
              </View>
              <View style={styles.recentChips}>
                {recentSearches.map((term, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleRecentTap(term)}
                    style={[styles.recentChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={{ color: colors.muted, fontSize: 13 }}>🕐</Text>
                    <Text style={[styles.recentText, { color: colors.foreground }]}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Browse by Type */}
          <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: 24 }]}>Browse by Type</Text>
          <View style={styles.browseGrid}>
            {[
              { type: "video", label: "Videos", count: "847", icon: "🎬" },
              { type: "audio", label: "Music", count: "312", icon: "🎵" },
              { type: "image", label: "Photos", count: "88", icon: "📷" },
            ].map((cat) => {
              const color = TYPE_COLOR[cat.type];
              return (
                <Pressable
                  key={cat.type}
                  onPress={() => {
                    setFilterType(cat.type as FilterType);
                    setQuery(" ");
                    setTimeout(() => setQuery(""), 0);
                  }}
                  style={[
                    styles.browseCard,
                    { backgroundColor: color + "18", borderColor: color },
                  ]}
                >
                  <Text style={{ fontSize: 32 }}>{cat.icon}</Text>
                  <Text style={[styles.browseLabel, { color }]}>{cat.label}</Text>
                  <Text style={[styles.browseCount, { color: colors.muted }]}>{cat.count} files</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
          <Text style={[styles.noResultsTitle, { color: colors.foreground }]}>No Results</Text>
          <Text style={[styles.noResultsSub, { color: colors.muted }]}>
            No media found for "{query}"
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 8 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: colors.muted }]}>
              {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 0.5,
  },
  backText: { fontSize: 22, fontWeight: "bold" },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  filterBar: { maxHeight: 52, borderBottomWidth: 0.5, paddingVertical: 8 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  filterLabel: { fontSize: 13, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  clearLink: { fontSize: 13 },
  recentChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  recentText: { fontSize: 13 },
  browseGrid: { flexDirection: "row", gap: 10, marginTop: 10 },
  browseCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 6,
  },
  browseLabel: { fontSize: 13, fontWeight: "bold" },
  browseCount: { fontSize: 11 },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  resultIconBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 13, fontWeight: "600", marginBottom: 3 },
  resultMeta: { fontSize: 11 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeTagText: { fontSize: 11, fontWeight: "600" },
  resultsCount: { fontSize: 12, marginBottom: 10 },
  noResults: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  noResultsTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  noResultsSub: { fontSize: 14 },
});
