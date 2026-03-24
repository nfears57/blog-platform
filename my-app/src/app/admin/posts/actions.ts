"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function createPost(formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);

  if (!title || !category || !content || !slug) {
    throw new Error("Title, slug/category and content are required.");
  }

  const { error } = await supabase.from("posts").insert({
    title,
    slug,
    category,
    content,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePost(postId: string, formData: FormData) {
  const { supabase } = await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugInput || title);

  if (!title || !category || !content || !slug) {
    throw new Error("Title, slug/category and content are required.");
  }

  const { error } = await supabase
    .from("posts")
    .update({
      title,
      slug,
      category,
      content,
    })
    .eq("id", postId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireAdmin();
  const postId = String(formData.get("postId") ?? "");

  if (!postId) {
    throw new Error("Post id is required.");
  }

  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
