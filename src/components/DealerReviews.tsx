import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

interface DealerReviewsProps {
  dealerId: string;
  dealerUserId: string;
  averageRating: number | null;
  totalReviews: number;
}

export function DealerReviews({ dealerId, dealerUserId, averageRating, totalReviews }: DealerReviewsProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  const isDealerOwner = user?.id === dealerUserId;

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["dealer-reviews", dealerId],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from("dealer_reviews")
        .select("id,dealer_id,reviewer_id,rating,title,comment,status,created_at,helpful_count,reported,verified_purchase")
        .eq("dealer_id", dealerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!reviews?.length) return [];

      const reviewerIds = reviews.flatMap((review) => review.reviewer_id ? [review.reviewer_id] : []);
      if (!reviewerIds.length) return reviews;

      const { data: badges, error: badgesError } = await supabase
        .from("public_profile_badges")
        .select("id,name,avatar_url")
        .in("id", reviewerIds);

      if (badgesError) throw badgesError;

      const badgesById = new Map(badges?.map((badge) => [badge.id, badge]) ?? []);
      return reviews.map((review) => {
        const badge = review.reviewer_id ? badgesById.get(review.reviewer_id) : null;
        return {
          ...review,
          profiles: badge ? { full_name: badge.name, avatar_url: badge.avatar_url } : null,
        };
      });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error("Please login to submit a review");
        return;
      }

      if (rating === 0) {
        toast.error("Please select a rating");
        return;
      }

      const { error } = await (supabase as any)
        .from("dealer_reviews")
        .insert({
          dealer_id: dealerId,
          reviewer_id: user.id,
          rating: rating,
          comment: reviewText || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setRating(0);
      setReviewText("");
      queryClient.invalidateQueries({ queryKey: ["dealer-reviews", dealerId] });
    },
    onError: (error: any) => {
      toast.error("Failed to submit review. Please try again.");
      console.error("Review submission error:", error);
    },
  });

  // Submit response mutation
  const submitResponseMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await (supabase as any)
        .from("dealer_reviews")
        .update({ dealer_response: responseText })
        .eq("id", reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Response added successfully!");
      setRespondingTo(null);
      setResponseText("");
      queryClient.invalidateQueries({ queryKey: ["dealer-reviews", dealerId] });
    },
    onError: (error: any) => {
      toast.error("Failed to add response. Please try again.");
      console.error("Response submission error:", error);
    },
  });

  const StarRating = ({ value, interactive = false, size = "w-5 h-5" }: { value: number; interactive?: boolean; size?: string }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= (interactive ? (hoveredRating || value) : value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer" : ""}`}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating?.toFixed(1) || "0.0"}</div>
            <StarRating value={Math.round(averageRating || 0)} />
            <div className="text-sm text-muted-foreground mt-1">
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r: any) => r.rating === star).length;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Write Review Form */}
      {!isDealerOwner && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Write a Review</h3>
          {user ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating *</label>
                <StarRating value={rating} interactive size="w-8 h-8" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this dealer..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => submitReviewMutation.mutate()}
                disabled={rating === 0 || submitReviewMutation.isPending}
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Please login to write a review</p>
              <Button asChild>
                <a href="/auth">Login</a>
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground">
              Be the first to review this dealer after visiting their showroom.
            </p>
          </Card>
        ) : (
          reviews.map((review: any) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {review.profiles?.avatar_url ? (
                    <img src={review.profiles.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="font-semibold text-primary">
                      {review.profiles?.full_name?.[0] || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold">{review.profiles?.full_name || "Anonymous"}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={review.rating} size="w-4 h-4" />
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  )}
                  
                  {/* Dealer Response */}
                  {review.dealer_response && (
                    <div className="mt-4 pl-4 border-l-2 border-primary/20">
                      <div className="text-xs font-semibold text-primary mb-1">Dealer Response</div>
                      <p className="text-sm text-muted-foreground">{review.dealer_response}</p>
                    </div>
                  )}

                  {/* Respond Button (Dealer Only) */}
                  {isDealerOwner && !review.dealer_response && (
                    <div className="mt-4">
                      {respondingTo === review.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write your response..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => submitResponseMutation.mutate(review.id)}
                              disabled={!responseText || submitResponseMutation.isPending}
                            >
                              {submitResponseMutation.isPending ? "Submitting..." : "Submit Response"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRespondingTo(review.id)}
                        >
                          Respond
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
