"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchForm({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();

  // Khởi tạo state bằng giá trị mặc định từ URL
  const [query, setQuery] = useState(defaultValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      router.push("/search");
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-2xl gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm bài viết..."
          // Giao diện: Nền trắng (bg-white), chữ đen (text-gray-900)
          className="block w-full rounded-xl border border-gray-300 bg-white px-5 py-3 text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 placeholder:text-gray-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="rounded-xl bg-blue-600 px-7 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-blue-200 active:scale-95"
      >
        Tìm kiếm
      </button>
    </form>
  );
}
