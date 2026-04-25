import { createClient } from "@/src/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
interface PostPageProps {
  params: Promise<{ slug: string }>;
}
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, status, author_id")
    .eq("slug", slug)
    .single();

  const canView =
    !!post &&
    (post.status === "published" || (user && post.author_id === user.id));

  return {
    title: canView ? post.title : "Bài viết",
    description: canView ? post.excerpt || "" : "",
  };
}
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    .single();

  const canView =
    !!post &&
    (post.status === "published" || (user && post.author_id === user.id));

  if (error || !post || !canView) {
    notFound();
  }
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
                ? new Date(post.published_at).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </time>
          </div>
        </header>
        <div className="prose prose-lg max-w-none">
          {/* Render markdown content */}
          {post.content?.split("\n").map((paragraph: string, index: number) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
