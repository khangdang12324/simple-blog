import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getLikeSummary } from "@/lib/likes";
import type { Post } from "@/types/database";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
      *,
      profiles!posts_author_id_fkey (
        display_name,
        avatar_url
      )
      `,
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  const likeSummary = await getLikeSummary(
    supabase,
    (posts || []).map((post) => post.id),
    user?.id,
  );

  if (error) {
    console.error("Error fetching posts:", error);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bài viết mới nhất
          </h1>
          <p className="mt-2 text-gray-600">
            Khám phá các bài viết công khai, tìm kiếm theo từ khóa, và lưu lại
            bài bạn thích.
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        >
          Tìm kiếm
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-bold">
            Không thể tải danh sách bài viết. Hãy kiểm tra database và RLS trên
            Supabase.
          </p>

          {/* MỚI: Bắt và in lỗi chi tiết ra màn hình */}
          <div className="mt-4 p-2 bg-red-100 rounded">
            <p className="font-semibold mb-1">Chi tiết lỗi từ Supabase:</p>
            <pre className="whitespace-pre-wrap font-mono text-xs text-red-600">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {(posts as Post[]).map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-semibold text-gray-900 transition-colors hover:text-blue-700">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="mt-2 leading-7 text-gray-600">{post.excerpt}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span>Bởi {post.profiles?.display_name || "Ẩn danh"}</span>
                <span>•</span>
                <span suppressHydrationWarning>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("vi-VN")
                    : "Chưa xuất bản"}
                </span>
                <span>•</span>
                <span>{likeSummary.counts[post.id] || 0} lượt thích</span>
              </div>

              <Link
                href={`/posts/${post.slug}`}
                className="mt-4 inline-block text-blue-700 hover:text-blue-800"
              >
                Đọc tiếp →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        /* Sửa lại phần này một chút để nếu có lỗi thì không hiện thêm chữ "Chưa có bài viết nào" */
        !error && (
          <div className="rounded-lg bg-white py-12 text-center shadow">
            <p className="text-gray-500">Chưa có bài viết nào.</p>
          </div>
        )
      )}
    </main>
  );
}
