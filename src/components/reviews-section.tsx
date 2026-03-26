"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useReviews, useAuth } from "@/components/providers";

interface ReviewsSectionProps {
  paintingId: string;
}

export function ReviewsSection({ paintingId }: ReviewsSectionProps) {
  const { getReviewsByPaintingId, getAverageRating, getRatingCount, addReview, markHelpful } = useReviews();
  const { isLoggedIn, user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isWritingReview, setIsWritingReview] = useState(false);

  const reviews = getReviewsByPaintingId(paintingId);
  const averageRating = getAverageRating(paintingId);
  const ratingCount = getRatingCount(paintingId);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn || !user) return;

    addReview({
      paintingId,
      userName: user.name,
      rating,
      comment,
    });

    setComment("");
    setRating(5);
    setIsWritingReview(false);
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
            disabled={!interactive}
            className={interactive ? "cursor-pointer transition-transform hover:scale-110" : "cursor-default"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={interactive ? "24" : "16"}
              height={interactive ? "24" : "16"}
              viewBox="0 0 24 24"
              fill={star <= (interactive ? (hoveredStar || rating) : rating) ? "#fbbf24" : "none"}
              stroke={star <= (interactive ? (hoveredStar || rating) : rating) ? "#fbbf24" : "#d1d5db"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mt-16">
      <Separator className="mb-8" />

      {/* Reviews Header */}
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Reviews & Ratings</h2>
        {ratingCount > 0 ? (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">
              Based on {ratingCount} {ratingCount === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this artwork!</p>
        )}
      </div>

      {/* Write Review Button */}
      {isLoggedIn && !isWritingReview && (
        <Button onClick={() => setIsWritingReview(true)} className="mb-8">
          Write a Review
        </Button>
      )}

      {!isLoggedIn && (
        <div className="bg-muted p-4 rounded-lg mb-8">
          <p className="text-sm text-muted-foreground">
            Please log in to write a review.
          </p>
        </div>
      )}

      {/* Write Review Form */}
      {isWritingReview && (
        <form onSubmit={handleSubmitReview} className="bg-muted p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            {renderStars(rating, true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this artwork..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={!comment.trim()}>
              Submit Review
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsWritingReview(false);
                setComment("");
                setRating(5);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{review.userName}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(review.date)}</p>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>

              <p className="text-muted-foreground mb-4">{review.comment}</p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => markHelpful(review.id)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 10v12" />
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                  </svg>
                  Helpful ({review.helpful})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
