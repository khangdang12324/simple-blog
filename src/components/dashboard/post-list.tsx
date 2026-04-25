import Link from "next/link";
import { DeletePostButton } from "@/components/dashboard/delete-post-button";
import type { Post } from "@/types/database";

interface PostListProps {
  posts: Post[];
}

export function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border border-gray-200 bg-white p-4 shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    post.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {post.status === "published" ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>

              {post.excerpt && (
                <p className="mb-2 text-sm leading-6 text-gray-600">
                  {post.excerpt}
                </p>
              )}

              <p className="text-xs text-gray-400">
                Tạo ngày: {new Date(post.created_at).toLocaleDateString("vi-VN")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/posts/${post.slug}`}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Xem
              </Link>
              <Link
                href={`/dashboard/edit/${post.id}`}
                className="px-3 py-1 text-sm text-blue-700 hover:text-blue-800"
              >
                Sửa
              </Link>
              <DeletePostButton postId={post.id} postTitle={post.title} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
