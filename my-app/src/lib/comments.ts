import { createClient } from "@/lib/supabase-server";

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export async function getCommentsByPostId(postId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_id, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("Could not find the table 'public.comments'")) {
      return [];
    }
    throw new Error(error.message);
  }

  return (data ?? []) as Comment[];
}
