import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

interface FollowDealerButtonProps {
  dealerId: string;
  followerCount?: number;
}

export function FollowDealerButton({ dealerId, followerCount = 0 }: FollowDealerButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is following
  const { data: isFollowing = false } = useQuery({
    queryKey: ["dealer-following", dealerId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("dealer_followers")
        .select("id")
        .eq("dealer_id", dealerId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        toast.error("Please login to follow dealers");
        navigate({ to: "/auth" });
        return;
      }

      const { error } = await supabase.from("dealer_followers").insert({
        dealer_id: dealerId,
        user_id: user.id,
        brand_filter: [],
        price_max: null,
      } as any);

      if (error) {
        // Check for unique constraint violation
        if (error.code === "23505") {
          toast.error("You're already following this dealer");
          return;
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Following! You'll be notified when new bikes are listed.");
      queryClient.invalidateQueries({ queryKey: ["dealer-following", dealerId] });
    },
    onError: (error: any) => {
      console.error("Follow error:", error);
      toast.error("Failed to follow dealer. Please try again.");
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;

      const { error } = await supabase
        .from("dealer_followers")
        .delete()
        .eq("dealer_id", dealerId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Unfollowed successfully");
      queryClient.invalidateQueries({ queryKey: ["dealer-following", dealerId] });
    },
    onError: (error: any) => {
      console.error("Unfollow error:", error);
      toast.error("Failed to unfollow dealer. Please try again.");
    },
  });

  const handleClick = () => {
    if (!user) {
      toast.error("Please login to follow dealers");
      navigate({ to: "/auth" });
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        variant={isFollowing ? "outline" : "default"}
        className="w-full"
        disabled={followMutation.isPending || unfollowMutation.isPending}
      >
        {isFollowing ? (
          <>
            <UserCheck className="w-4 h-4 mr-2" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Follow dealer
          </>
        )}
      </Button>

      {followerCount > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </p>
      )}

      <div className="text-xs text-muted-foreground space-y-1 mt-3">
        <p className="font-medium">Follow this dealer to get notified when new bikes are listed.</p>
        <p>You can unfollow anytime.</p>
      </div>
    </div>
  );
}
