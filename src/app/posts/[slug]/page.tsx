import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommentForm } from "@/components/posts/comment-form";
import { CommentList } from "@/components/posts/comment-list";
import { LikeButton } from "@/components/posts/like-button";
import { createClient } from "@/lib/supabase/server";
import { getLikeSummary } from "@/lib/likes";
import type { Comment } from "@/types/database";

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

  const { data: post, error } = await supabase
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
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !post) {
    notFound();
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const likeSummary = await getLikeSummary(supabase, [post.id], user?.id);
  const likeCount = likeSummary.counts[post.id] || 0;
  const likedByUser = likeSummary.likedPostIds.has(post.id);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {post.title}
          </h1>

          <div className="mb-6 flex flex-wrap items-center gap-4 text-gray-500">
            <span>Bởi {post.profiles?.display_name || "Ẩn danh"}</span>
            <span>•</span>
            <time suppressHydrationWarning>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
          </div>

          <LikeButton
            postId={post.id}
            initialCount={likeCount}
            initialLiked={likedByUser}
            isAuthenticated={Boolean(user)}
          />
        </header>

        <div className="mb-12 rounded-lg bg-white p-6 shadow">
          {post.content ? (
            <div className="prose prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-md prose-a:text-blue-700 hover:prose-a:text-blue-800">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-500">Chưa có nội dung cho bài viết này.</p>
          )}
        </div>
      </article>

      <section className="border-t pt-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Bình luận ({comments?.length || 0})
        </h2>
        {user ? (
          <div className="mb-8">
            <CommentForm postId={post.id} />
          </div>
        ) : (
          <p className="mb-8 text-gray-500">
            <Link href="/login" className="text-blue-700 hover:text-blue-800">
              Đăng nhập
            </Link>{" "}
            để bình luận.
          </p>
        )}

        <CommentList comments={(comments || []) as Comment[]} />
      </section>
    </main>
  );
}
