import { notFound, redirect } from "next/navigation";
import { PostForm } from "@/components/dashboard/post-form";
import { createClient } from "@/lib/supabase/server";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (error || !post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Chỉnh sửa bài viết</h1>
      <PostForm post={post} />
    </main>
  );
}
