import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategories,
  getCategoryBySlug,
  getPosts,
  toCategorySlug,
} from "@/lib/posts";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const [categoryName, categories] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getCategories(),
  ]);

  if (!categoryName) {
    notFound();
  }

  const posts = await getPosts(categoryName);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-14">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold">{categoryName}</h1>
          <p className="text-zinc-600">Posts in this category.</p>
        </div>
        <Link className="rounded border px-4 py-2" href="/">
          All posts
        </Link>
      </header>

      <section className="flex flex-wrap gap-2">
        <Link className="rounded-full border px-3 py-1 text-sm" href="/">
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            className={`rounded-full border px-3 py-1 text-sm ${
              item === categoryName ? "bg-black text-white" : ""
            }`}
            href={`/category/${toCategorySlug(item)}`}
          >
            {item}
          </Link>
        ))}
      </section>

      <section className="grid gap-4">
        {posts.length === 0 ? (
          <p className="text-zinc-600">No posts found in this category.</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="rounded border p-5">
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                {post.category}
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
