"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Bạn cần đăng nhập để bình luận.");
        return;
      }

      const trimmedContent = content.trim();

      if (!trimmedContent) {
        setError("Nội dung bình luận không được để trống.");
        return;
      }

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        author_id: user.id,
        content: trimmedContent,
      });

      if (error) throw error;

      setContent("");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Viết bình luận của bạn..."
        />
      </div>

      <button
        type="submit"
        disabled={loading || !content.trim()}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang gửi..." : "Gửi bình luận"}
      </button>
    </form>
  );
}
