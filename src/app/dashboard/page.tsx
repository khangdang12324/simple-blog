import Link from "next/link";
import { redirect } from "next/navigation";
import { PostList } from "@/components/dashboard/post-list";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bài viết của tôi</h1>
        <Link
          href="/dashboard/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Viết bài mới
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Không thể tải danh sách bài viết của bạn.
        </div>
      ) : posts && posts.length > 0 ? (
        <PostList posts={posts as Post[]} />
      ) : (
        <div className="rounded-lg bg-white py-12 text-center shadow">
          <p className="mb-4 text-gray-500">Bạn chưa có bài viết nào.</p>
          <Link
            href="/dashboard/new"
            className="text-blue-700 hover:text-blue-800"
          >
            Viết bài đầu tiên →
          </Link>
        </div>
      )}
    </main>
  );
}
