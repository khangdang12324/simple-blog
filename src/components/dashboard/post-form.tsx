"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Post, PostStatus } from "@/types/database";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function mapStorageError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("bucket")) {
    return "Bucket post-images chưa được tạo trên Supabase. Hãy chạy file SQL mới trước.";
  }

  if (normalized.includes("mime")) {
    return "Định dạng ảnh không hợp lệ. Hãy dùng PNG, JPG, WEBP hoặc GIF.";
  }

  return message;
}

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditing = Boolean(post);
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [status, setStatus] = useState<PostStatus>(post?.status || "draft");
  const [error, setError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const insertMarkdownAtCursor = (markdown: string) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      setContent((current) =>
        current.trim() ? `${current}\n\n${markdown}` : markdown,
      );
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const nextContent =
      content.slice(0, start) + markdown + content.slice(end);

    setContent(nextContent);

    requestAnimationFrame(() => {
      const cursorPosition = start + markdown.length;
      textarea.focus();
      textarea.selectionStart = cursorPosition;
      textarea.selectionEnd = cursorPosition;
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setUploadMessage(null);
    setUploadingImage(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Bạn cần đăng nhập để tải ảnh lên.");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Chỉ được tải lên file ảnh.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Ảnh vượt quá 5MB. Hãy chọn ảnh nhỏ hơn.");
        return;
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "png";
      const baseName = slugify(file.name.replace(/\.[^/.]+$/, "")) || "image";
      const filePath = `${user.id}/${Date.now()}-${baseName}.${extension}`;

      const { error } = await supabase.storage
        .from("post-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
      const markdown = `![${baseName}](${data.publicUrl})`;

      insertMarkdownAtCursor(markdown);
      setUploadMessage(
        "Tải ảnh thành công. Đường dẫn Markdown đã được chèn vào nội dung.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? mapStorageError(err.message)
          : "Không thể tải ảnh lên.",
      );
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadMessage(null);
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Bạn cần đăng nhập để thực hiện thao tác này.");
        return;
      }

      const trimmedTitle = title.trim();
      const trimmedExcerpt = excerpt.trim();
      const trimmedContent = content.trim();
      const slug = slugify(trimmedTitle);

      if (!slug) {
        setError("Tiêu đề không hợp lệ để tạo slug.");
        return;
      }

      const postData = {
        title: trimmedTitle,
        slug,
        content: trimmedContent || null,
        excerpt: trimmedExcerpt || null,
        status,
        author_id: user.id,
        published_at:
          status === "published"
            ? post?.published_at ?? new Date().toISOString()
            : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("posts")
          .update(postData)
          .eq("id", post!.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("posts").insert(postData);

        if (error) throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {uploadMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {uploadMessage}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Tiêu đề <span className="text-red-700">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Nhập tiêu đề bài viết"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="block text-sm font-medium text-gray-700"
        >
          Tóm tắt
        </label>
        <input
          id="excerpt"
          type="text"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Mô tả ngắn về bài viết"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Nội dung
          </label>

          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingImage ? "Đang tải ảnh..." : "Tải ảnh lên"}
            </button>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="Viết nội dung bài viết của bạn..."
        />
        <p className="text-xs text-gray-500">
          Hỗ trợ Markdown. Ảnh tải lên sẽ tự chèn theo cú pháp
          <code className="mx-1 rounded bg-gray-100 px-1 py-0.5 text-gray-700">
            ![alt](url)
          </code>
          vào vị trí con trỏ.
        </p>
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Trạng thái
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PostStatus)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          <option value="draft">Bản nháp</option>
          <option value="published">Xuất bản</option>
        </select>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : isEditing ? "Cập nhật" : "Tạo bài viết"}
        </button>
      </div>
    </form>
  );
}
