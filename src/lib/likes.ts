import type { SupabaseClient } from "@supabase/supabase-js";
import type { Like } from "@/types/database";

interface LikeSummary {
  counts: Record<string, number>;
  likedPostIds: Set<string>;
}

export async function getLikeSummary(
  supabase: SupabaseClient,
  postIds: string[],
  currentUserId?: string | null,
): Promise<LikeSummary> {
  const counts = Object.fromEntries(postIds.map((postId) => [postId, 0]));
  const likedPostIds = new Set<string>();

  if (postIds.length === 0) {
    return { counts, likedPostIds };
  }

  const { data, error } = await supabase
    .from("likes")
    .select("post_id, user_id")
    .in("post_id", postIds);

  if (error) {
    if (error.code !== "42P01") {
      console.error("Error fetching likes:", error);
    }

    return { counts, likedPostIds };
  }

  for (const like of (data || []) as Like[]) {
    counts[like.post_id] = (counts[like.post_id] || 0) + 1;

    if (currentUserId && like.user_id === currentUserId) {
      likedPostIds.add(like.post_id);
    }
  }

  return { counts, likedPostIds };
}
