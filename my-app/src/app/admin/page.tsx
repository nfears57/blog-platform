import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { signOut } from "./actions";
import Link from "next/link";
import { deletePost } from "./posts/actions";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.app_metadata?.role;
  if (role !== "admin") {
    redirect("/forbidden");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("id, title, slug, category, created_at")
    .order("created_at", { ascending: false });

  const isMissingPostsTable =
    error?.message.includes("Could not find the table 'public.posts'") ?? false;

  if (error && !isMissingPostsTable) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Admin</h1>
        <Link className="rounded bg-black px-4 py-2 text-white" href="/admin/posts/new">
          New post
        </Link>
      </div>
      <p className="text-zinc-700">
        Logged in as {user.email} (role: {role})
      </p>

      <section className="grid gap-3">
        {isMissingPostsTable ? (
          <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            `posts` table is missing in Supabase. Run `supabase/posts.sql` in SQL
            Editor to enable blog CRUD.
          </div>
        ) : null}
        {(posts ?? []).length === 0 ? (
          <p className="text-sm text-zinc-600">No posts yet.</p>
        ) : (
          posts?.map((post) => (
            <article
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded border p-4"
            >
              <div>
                <h2 className="font-semibold">{post.title}</h2>
                <p className="text-xs text-zinc-500">
                  {post.category} - {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Link className="rounded border px-3 py-1 text-sm" href={`/blog/${post.slug}`}>
                  View
                </Link>
                <Link
                  className="rounded border px-3 py-1 text-sm"
                  href={`/admin/posts/${post.id}/edit`}
                >
                  Edit
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button className="rounded border px-3 py-1 text-sm" type="submit">
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))
        )}
      </section>

      <form action={signOut}>
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}
