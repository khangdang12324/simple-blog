"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setMessage("Cập nhật hồ sơ thành công!");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra khi cập nhật.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow"
    >
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      <div className="mb-6 flex items-center gap-6">
        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-300 bg-gray-200">
          {avatarUrl ? (
            <div
              aria-label="Avatar preview"
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${avatarUrl})` }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              Trống
            </div>
          )}
        </div>

        <div className="flex-1">
          <label
            htmlFor="avatarUrl"
            className="block text-sm font-medium text-gray-700"
          >
            URL ảnh đại diện
          </label>
          <input
            id="avatarUrl"
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="displayName"
          className="block text-sm font-medium text-gray-700"
        >
          Tên hiển thị
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
