"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface LikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}

function mapLikeError(message: string) {
  if (message.toLowerCase().includes("duplicate")) {
    return "Bạn đã thích bài viết này rồi.";
  }

  return message;
}

export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  isAuthenticated,
}: LikeButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login?message=Vui lòng đăng nhập để thích bài viết.");
      return;
    }

    setError(null);
    setLoading(true);

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((current) => current + (nextLiked ? 1 : -1));

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?message=Vui lòng đăng nhập để thích bài viết.");
        return;
      }

      if (nextLiked) {
        const { error } = await supabase.from("likes").insert({
          post_id: postId,
          user_id: user.id,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (error) throw error;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setLiked(!nextLiked);
      setLikeCount((current) => current - (nextLiked ? 1 : -1));
      setError(
        err instanceof Error
          ? mapLikeError(err.message)
          : "Không thể cập nhật lượt thích.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={loading}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            liked
              ? "border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100"
              : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {liked ? "Đã thích" : "Thích"}
        </button>

        <span className="text-sm font-medium text-gray-600">
          {likeCount} lượt thích
        </span>
      </div>

      {!isAuthenticated && (
        <p className="text-sm text-gray-500">
          <Link href="/login" className="text-blue-700 hover:text-blue-800">
            Đăng nhập
          </Link>{" "}
          để thích bài viết này.
        </p>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
