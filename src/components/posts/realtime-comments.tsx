"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CommentList } from "@/components/posts/comment-list";
import type { Comment } from "@/types/database";

interface RealtimeCommentsProps {
  postId: string;
  initialComments: Comment[];
}

export function RealtimeComments({
  postId,
  initialComments,
}: RealtimeCommentsProps) {
  const [supabase] = useState(createClient);
  const [comments, setComments] = useState<Comment[]>(initialComments);

  useEffect(() => {
    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        async (payload) => {
          const { data: newComment } = await supabase
            .from("comments")
            .select(
              `
              *,
              profiles (
                display_name,
                avatar_url
              )
              `,
            )
            .eq("id", payload.new.id)
            .single();

          if (newComment) {
            setComments((prev) =>
              prev.some((comment) => comment.id === newComment.id)
                ? prev
                : [...prev, newComment as Comment],
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase]);

  return <CommentList comments={comments} />;
}
