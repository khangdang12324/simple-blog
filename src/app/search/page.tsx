import Link from "next/link";
import { SearchForm } from "@/components/layout/search-form";
import { createClient } from "@/lib/supabase/server";
import { getLikeSummary } from "@/lib/likes";
import { highlightSearchText, normalizeSearchQuery } from "@/lib/search";
import type { SearchResult } from "@/types/database";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = normalizeSearchQuery(params.q);
  const supabase = await createClient();

  let results: SearchResult[] = [];
  let errorMessage: string | null = null;

  if (query) {
    const { data, error } = await supabase.rpc("search_posts", {
      search_query: query,
    });

    if (error) {
      errorMessage =
        error.code === "42883"
          ? "Hàm tìm kiếm chưa tồn tại trên Supabase. Hãy chạy file SQL mới trong SQL Editor."
          : "Không thể tìm kiếm bài viết lúc này.";
    } else {
      results = (data || []) as SearchResult[];
    }
  }

  const likeSummary = await getLikeSummary(
    supabase,
    results.map((result) => result.id),
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Tìm kiếm bài viết
          </h1>
          <p className="mt-2 text-gray-600">
            Tìm theo tiêu đề, tóm tắt hoặc nội dung bài viết bằng full-text
            search của PostgreSQL.
          </p>
        </div>

        <SearchForm key={query} defaultValue={query} />
      </div>

      {query ? (
        <p className="mb-6 text-sm text-gray-500">
          Kết quả cho từ khóa:{" "}
          <span className="font-semibold text-gray-800">{query}</span>
        </p>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
          Nhập từ khóa để tìm kiếm bài viết.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      {query && !errorMessage && results.length === 0 && (
        <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow">
          Không tìm thấy bài viết phù hợp.
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result) => (
            <article
              key={result.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow"
            >
              <Link href={`/posts/${result.slug}`}>
                <h2
                  className="text-2xl font-semibold text-gray-900 transition-colors hover:text-blue-700"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchText(result.title, query),
                  }}
                />
              </Link>

              <p
                className="mt-3 leading-7 text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: highlightSearchText(result.excerpt_preview, query),
                }}
              />

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span>Bởi {result.display_name || "Ẩn danh"}</span>
                <span>•</span>
                <span>
                  {result.published_at
                    ? new Date(result.published_at).toLocaleDateString("vi-VN")
                    : "Chưa xuất bản"}
                </span>
                <span>•</span>
                <span>{likeSummary.counts[result.id] || 0} lượt thích</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
