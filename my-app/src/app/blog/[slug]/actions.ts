"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

export async function createComment(formData: FormData) {
  const { supabase, user } = await requireUser();
  const postId = String(formData.get("postId") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!postId || !slug || !content) {
    throw new Error("Post id, slug, and content are required.");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/blog/${slug}`);
}

export async function deleteComment(formData: FormData) {
  const { supabase, user } = await requireUser();
  const commentId = String(formData.get("commentId") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!commentId || !slug) {
    throw new Error("Comment id and slug are required.");
  }

  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .select("id, user_id")
    .eq("id", commentId)
    .single();

  if (commentError || !comment) {
    throw new Error(commentError?.message ?? "Comment not found.");
  }

  const isOwner = comment.user_id === user.id;
  const isAdmin = user.app_metadata?.role === "admin";
  if (!isOwner && !isAdmin) {
    throw new Error("Not allowed to delete this comment.");
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/blog/${slug}`);
}

export async function toggleLike(formData: FormData) {
  const { supabase, user } = await requireUser();
  const postId = String(formData.get("postId") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();

  if (!postId || !slug) {
    throw new Error("Post id and slug are required.");
  }

  const { data: existingLike, error: existingLikeError } = await supabase
    .from("likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingLikeError) {
    throw new Error(existingLikeError.message);
  }

  if (existingLike) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("likes").insert({
      post_id: postId,
      user_id: user.id,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  revalidatePath(`/blog/${slug}`);
}
