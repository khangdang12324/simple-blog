function escapeHtml(value: string | null | undefined) {
  if (!value) return "";

  return value
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// LỖI Ở ĐÂY: Đảm bảo có từ 'export' ở phía trước hàm này
export function normalizeSearchQuery(value: string | undefined) {
  return value?.trim() || "";
}

export function extractSearchTerms(query: string) {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 1),
    ),
  );
}

export function highlightSearchText(
  text: string | null | undefined,
  query: string,
) {
  if (!text) return "";

  const safeText = escapeHtml(text);
  const terms = extractSearchTerms(query);

  if (!safeText || terms.length === 0) {
    return safeText;
  }

  const pattern = new RegExp(
    `(${terms.map((term) => escapeRegExp(term)).join("|")})`,
    "gi",
  );

  return safeText.replace(
    pattern,
    '<mark class="rounded bg-black px-1 text-white font-medium">$1</mark>',
  );
}
