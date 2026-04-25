"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa bài viết "${postTitle}"? Hành động này không thể hoàn tác.`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("posts")
        .delete()
        .eq("id", postId)
        .select("id");

      if (error) throw error;

      if (!data || data.length === 0) {
        alert("Không thể xóa bài viết này. Có thể bạn không có quyền.");
        return;
      }

      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa bài viết.";
      alert(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-50"
    >
      {loading ? "Đang xóa..." : "Xóa"}
    </button>
  );
}
