// Copyright © Knoux. All rights reserved.
/**
 * RatingsReviewsService - Manage app ratings and user reviews
 */

export interface UserReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  title: string;
  content: string;
  timestamp: number;
  helpful: number; // count of helpful votes
  images?: string[];
  verified: boolean; // verified purchase
  response?: {
    text: string;
    timestamp: number;
  };
}

export interface RatingsStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number; // 1-5 stars count
  };
  helpfulReviews: UserReview[];
  recentReviews: UserReview[];
}

class RatingsReviewsServiceClass {
  private reviews: Map<string, UserReview> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSampleReviews();
  }

  private initializeSampleReviews(): void {
    const sampleReviews: UserReview[] = [
      {
        id: "review_1",
        userId: "user_1",
        userName: "Ahmed M.",
        rating: 5,
        title: "Best recording app ever!",
        content:
          "This app is amazing! The video quality is incredible and the editing features are so easy to use. Highly recommended!",
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        helpful: 245,
        verified: true,
      },
      {
        id: "review_2",
        userId: "user_2",
        userName: "Fatima K.",
        rating: 5,
        title: "Professional quality at affordable price",
        content:
          "I switched from expensive software to this app and I'm not looking back. The features are professional-grade and the price is unbeatable.",
        timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
        helpful: 189,
        verified: true,
      },
      {
        id: "review_3",
        userId: "user_3",
        userName: "Mohammed S.",
        rating: 4,
        title: "Great app with minor issues",
        content:
          "Overall excellent app. The interface is intuitive and features are comprehensive. Just had a couple of crashes on my older device.",
        timestamp: Date.now() - 21 * 24 * 60 * 60 * 1000,
        helpful: 156,
        verified: true,
      },
      {
        id: "review_4",
        userId: "user_4",
        userName: "Layla H.",
        rating: 5,
        title: "Perfect for content creators",
        content:
          "As a YouTuber, this app has become essential to my workflow. The quality and speed are unmatched. Worth every penny!",
        timestamp: Date.now() - 28 * 24 * 60 * 60 * 1000,
        helpful: 312,
        verified: true,
      },
      {
        id: "review_5",
        userId: "user_5",
        userName: "Omar T.",
        rating: 4,
        title: "Solid choice for recording",
        content:
          "Good app overall. Performance is solid and features are great. Would love to see more customization options.",
        timestamp: Date.now() - 35 * 24 * 60 * 60 * 1000,
        helpful: 98,
        verified: true,
      },
    ];

    sampleReviews.forEach((review) => {
      this.reviews.set(review.id, review);
    });
  }

  submitReview(review: Omit<UserReview, "id" | "timestamp" | "helpful">): UserReview {
    const newReview: UserReview = {
      ...review,
      id: `review_${Date.now()}`,
      timestamp: Date.now(),
      helpful: 0,
    };

    this.reviews.set(newReview.id, newReview);
    this.emit("reviewSubmitted", { review: newReview });
    return newReview;
  }

  getReviews(
    sortBy: "recent" | "helpful" | "rating" = "helpful",
    limit: number = 10
  ): UserReview[] {
    let reviews = Array.from(this.reviews.values());

    switch (sortBy) {
      case "recent":
        reviews.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case "helpful":
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
      case "rating":
        reviews.sort((a, b) => b.rating - a.rating);
        break;
    }

    return reviews.slice(0, limit);
  }

  getReviewsByRating(rating: number): UserReview[] {
    return Array.from(this.reviews.values()).filter((r) => r.rating === rating);
  }

  getRatingsStats(): RatingsStats {
    const reviews = Array.from(this.reviews.values());
    const ratingDistribution: { [key: number]: number } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    let totalRating = 0;

    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
      totalRating += review.rating;
    });

    const helpfulReviews = reviews
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, 5);

    const recentReviews = reviews
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    return {
      averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
      totalReviews: reviews.length,
      ratingDistribution,
      helpfulReviews,
      recentReviews,
    };
  }

  markHelpful(reviewId: string): void {
    const review = this.reviews.get(reviewId);
    if (review) {
      review.helpful++;
      this.emit("reviewMarkedHelpful", { reviewId, helpful: review.helpful });
    }
  }

  respondToReview(reviewId: string, response: string): void {
    const review = this.reviews.get(reviewId);
    if (review) {
      review.response = {
        text: response,
        timestamp: Date.now(),
      };
      this.emit("reviewResponded", { reviewId, response });
    }
  }

  deleteReview(reviewId: string): void {
    this.reviews.delete(reviewId);
    this.emit("reviewDeleted", { reviewId });
  }

  flagReview(reviewId: string, reason: string): void {
    const review = this.reviews.get(reviewId);
    if (review) {
      this.emit("reviewFlagged", { reviewId, reason });
    }
  }

  on(event: string, cb: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(cb);
  }

  off(event: string, cb: Function): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) || []).filter((c) => c !== cb)
    );
  }

  private emit(event: string, data: any): void {
    (this.listeners.get(event) || []).forEach((cb) => cb(data));
  }
}

export const RatingsReviewsService = new RatingsReviewsServiceClass();
