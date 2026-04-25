import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import type { Post } from "@/src/types/database";

type PostWithProfile = Post & {
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

const PAGE_SIZE = 5;

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const currentPage = Number.isNaN(page) || page < 1 ? 1 : page;
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const { count } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");

  // Lấy bài viết đã publish, kèm thông tin author
  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      `
 *,
 profiles (
 display_name,
 avatar_url
 )
 `,
    )
    .eq("status", "published")
    .range(from, to)
    .order("published_at", { ascending: false });

  const totalPosts = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE));
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (error) {
    console.error("Error fetching posts:", error);
  }
  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Bài viết mới nhất</h1>
      {posts && posts.length > 0 ? (
        <div className="space-y-6">
          {(posts as PostWithProfile[]).map((post) => (
            <article
              key={post.id}
              className="rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow"
            >
              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-semibold text-gray-900 transition-colors hover:text-blue-600">
                  {post.title}
                </h2>
              </Link>

              {post.excerpt && (
                <p className="mt-2 text-gray-600">{post.excerpt}</p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span>Bởi {post.profiles?.display_name || "Ẩn danh"}</span>
                <span>•</span>
                <span>
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString("vi-VN")
                    : "Chưa xuất bản"}
                </span>
              </div>

              <Link
                href={`/posts/${post.slug}`}
                className="mt-4 inline-block text-blue-700 hover:text-blue-800"
              >
                Đọc tiếp →
              </Link>
            </article>
          ))}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            <span>
              Trang {currentPage}/{totalPages}
            </span>

            <div className="flex items-center gap-2">
              {hasPrevious ? (
                <Link
                  href={`/?page=${currentPage - 1}`}
                  className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
                >
                  ← Trang trước
                </Link>
              ) : (
                <span className="rounded-md border border-gray-200 px-3 py-1 text-gray-400">
                  ← Trang trước
                </span>
              )}

              {hasNext ? (
                <Link
                  href={`/?page=${currentPage + 1}`}
                  className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50"
                >
                  Trang sau →
                </Link>
              ) : (
                <span className="rounded-md border border-gray-200 px-3 py-1 text-gray-400">
                  Trang sau →
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Chưa có bài viết nào.</p>
        </div>
      )}
    </main>
  );
}
