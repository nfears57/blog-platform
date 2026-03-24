import { createClient } from "@/lib/supabase-server";

function isMissingLikesTableError(message: string) {
  return message.includes("Could not find the table 'public.likes'");
}

export async function getLikesForPost(postId: string, userId?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("likes")
    .select("user_id")
    .eq("post_id", postId);

  if (error) {
    if (isMissingLikesTableError(error.message)) {
      return { count: 0, likedByUser: false, hasLikesTable: false };
    }
    throw new Error(error.message);
  }

  const likes = data ?? [];
  return {
    count: likes.length,
    likedByUser: !!userId && likes.some((row) => row.user_id === userId),
    hasLikesTable: true,
  };
}
