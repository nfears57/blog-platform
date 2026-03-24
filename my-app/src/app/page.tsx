import Link from "next/link";
import { getCategories, getPosts, toCategorySlug } from "@/lib/posts";
import SupporterButton from "@/components/supporter-button";

export default async function Home() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);
  const hasNoPostsYet = posts.length === 0 && categories.length === 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">Blog</h1>
          <p className="text-zinc-600">Posts powered by Supabase.</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded border px-4 py-2" href="/admin">
            Admin
          </Link>
          <Link className="rounded border px-4 py-2" href="/login">
            Log in
          </Link>
        </div>
      </header>

      <section className="flex flex-wrap gap-2">
        <Link
          className="rounded-full border bg-black px-3 py-1 text-sm text-white"
          href="/"
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            className="rounded-full border px-3 py-1 text-sm"
            href={`/category/${toCategorySlug(item)}`}
          >
            {item}
          </Link>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="rounded border p-5">
          <h2 className="text-xl font-semibold">Support this blog</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Join the monthly supporter tier with Stripe.
          </p>
          <div className="mt-4">
            <SupporterButton />
          </div>
        </div>

        {hasNoPostsYet ? (
          <div className="rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            No posts table/data found yet. Run the SQL in `supabase/posts.sql` in
            your Supabase SQL Editor, then refresh.
          </div>
        ) : null}
        {posts.length === 0 ? (
          <p className="text-zinc-600">No posts found.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded border p-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                <Link className="underline" href={`/category/${toCategorySlug(post.category)}`}>
                  {post.category}
                </Link>
              </p>
              <h2 className="text-2xl font-semibold">{post.title}</h2>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-zinc-700">
                {post.content}
              </p>
              <Link
                className="mt-4 inline-block text-sm font-medium underline"
                href={`/blog/${post.slug}`}
              >
                Read more
              </Link>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
