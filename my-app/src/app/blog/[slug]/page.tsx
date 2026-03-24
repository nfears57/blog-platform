import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, incrementPostViews, toCategorySlug } from "@/lib/posts";
import { createClient } from "@/lib/supabase-server";
import { getCommentsByPostId } from "@/lib/comments";
import { getLikesForPost } from "@/lib/likes";
import { createComment, deleteComment, toggleLike } from "./actions";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const views = await incrementPostViews(slug);
  const comments = await getCommentsByPostId(post.id);
  const likes = await getLikesForPost(post.id, user?.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-14">
      <Link className="text-sm underline" href="/">
        Back to posts
      </Link>

      <article className="rounded border p-6">
        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
          <Link className="underline" href={`/category/${toCategorySlug(post.category)}`}>
            {post.category}
          </Link>
        </p>
        <h1 className="text-4xl font-semibold">{post.title}</h1>
        <p className="mt-3 text-sm text-zinc-500">
          Published {new Date(post.created_at).toLocaleDateString()}
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Views: {views ?? "Enable in SQL"}
        </p>
        <div className="mt-6 whitespace-pre-wrap leading-7 text-zinc-800">
          {post.content}
        </div>

        <div className="mt-6 flex items-center gap-3">
          {user ? (
            <form action={toggleLike}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="slug" value={slug} />
              <button className="rounded border px-3 py-1 text-sm" type="submit">
                {likes.likedByUser ? "Unlike" : "Like"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-zinc-600">
              <Link className="underline" href="/login">
                Log in
              </Link>{" "}
              to like this post.
            </p>
          )}
          <p className="text-sm text-zinc-600">{likes.count} likes</p>
        </div>

        {!likes.hasLikesTable ? (
          <p className="mt-3 text-sm text-amber-700">
            Likes table is missing. Re-run `supabase/posts.sql` in Supabase SQL
            Editor to enable likes.
          </p>
        ) : null}
      </article>

      <section className="rounded border p-6">
        <h2 className="text-2xl font-semibold">Comments</h2>

        {user ? (
          <form action={createComment} className="mt-4 grid gap-3">
            <input type="hidden" name="postId" value={post.id} />
            <input type="hidden" name="slug" value={slug} />
            <textarea
              className="min-h-24 rounded border p-3"
              name="content"
              placeholder="Write a comment..."
              required
            />
            <button className="w-fit rounded bg-black px-4 py-2 text-white" type="submit">
              Add comment
            </button>
          </form>
        ) : (
          <p className="mt-3 text-sm text-zinc-600">
            <Link href="/login" className="underline">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}

        <div className="mt-6 grid gap-3">
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-600">No comments yet.</p>
          ) : (
            comments.map((comment) => {
              const canDelete =
                !!user && (comment.user_id === user.id || user.app_metadata?.role === "admin");

              return (
                <article key={comment.id} className="rounded border p-4">
                  <p className="text-xs text-zinc-500">
                    {new Date(comment.created_at).toLocaleString()} - {comment.user_id.slice(0, 8)}
                    ...
                  </p>
                  <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                  {canDelete ? (
                    <form action={deleteComment} className="mt-3">
                      <input type="hidden" name="commentId" value={comment.id} />
                      <input type="hidden" name="slug" value={slug} />
                      <button className="rounded border px-3 py-1 text-sm" type="submit">
                        Delete
                      </button>
                    </form>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
