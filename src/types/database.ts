export type PostStatus = "draft" | "published";

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileSummary {
  display_name: string | null;
  avatar_url: string | null;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  profiles?: ProfileSummary | null;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: ProfileSummary | null;
}

export interface Like {
  post_id: string;
  user_id: string;
  created_at?: string;
}

export interface SearchResult {
  id: string;
  slug: string;
  title: string;
  excerpt_preview: string;
  published_at: string | null;
  display_name: string | null;
  avatar_url: string | null;
  rank: number;
}
