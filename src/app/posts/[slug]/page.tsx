import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommentForm } from "@/src/components/posts/comment-form";
import { CommentList } from "@/src/components/posts/comment-list";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  return {
    title: post?.title || "Bài viết",
    description: post?.excerpt || "",
  };
}
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  // Lấy bài viết
  const { data: post, error } = await supabase
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
    .eq("slug", slug)
    .eq("status", "published")
    .single();
  if (error || !post) {
    notFound();
  }
  // Lấy comments
  const { data: comments } = await supabase
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
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });
  // Kiểm tra user đã đăng nhập chưa
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-gray-500">
            <span>Bởi {post.profiles?.display_name || "Ẩn danh"}</span>
            <span>•</span>
            <time>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("viVN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
          </div>
        </header>
        <div className="prose prose-lg max-w-none mb-12">
          {post.content?.split("\n").map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
      {/* Comments Section */}
      <section className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">
          Bình luận ({comments?.length || 0})
        </h2>
        {user ? (
          <div className="mb-8">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="text-gray-500 mb-8">
            <a href="/login" className="text-blue-600 hover:text-blue-500">
              Đăng nhập
            </a>{" "}
            để bình luận.
          </p>
        )}
        <CommentList comments={comments || []} />
      </section>
    </main>
  );
}
