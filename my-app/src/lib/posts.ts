import { createClient } from "@/lib/supabase-server";

export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
};

function isMissingPostsTableError(message: string) {
  return message.includes("Could not find the table 'public.posts'");
}

export function toCategorySlug(category: string) {
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function getPosts(category?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("id, slug, title, content, category, created_at")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingPostsTableError(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as Post[];
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("category")
    .order("category", { ascending: true });

  if (error) {
    if (isMissingPostsTableError(error.message)) {
      return [];
    }
    throw new Error(error.message);
  }

  const categories = Array.from(
    new Set((data ?? []).map((row) => row.category).filter(Boolean)),
  );

  return categories;
}

export async function getCategoryBySlug(categorySlug: string) {
  const categories = await getCategories();
  return categories.find((category) => toCategorySlug(category) === categorySlug) ?? null;
}

export async function getPostBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, content, category, created_at")
    .eq("slug", slug)
    .single();

  if (error) {
    if (isMissingPostsTableError(error.message)) {
      return null;
    }
    return null;
  }

  return data as Post;
}

export async function getPostById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("id, slug, title, content, category, created_at")
    .eq("id", id)
    .single();

  if (error) {
    if (isMissingPostsTableError(error.message)) {
      return null;
    }
    return null;
  }

  return data as Post;
}

export async function incrementPostViews(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("increment_post_views", {
    target_slug: slug,
  });

  if (error) {
    const expectedSetupError =
      error.message.includes("Could not find the function public.increment_post_views") ||
      error.message.includes("Could not find the table 'public.posts'");

    if (expectedSetupError) {
      return null;
    }

    throw new Error(error.message);
  }

  return typeof data === "number" ? data : null;
}
