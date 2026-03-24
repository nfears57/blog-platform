import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPostById } from "@/lib/posts";
import { updatePost } from "../../../posts/actions";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireAdmin();
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const updatePostWithId = updatePost.bind(null, post.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-14">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Edit post</h1>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <form action={updatePostWithId} className="grid gap-4 rounded border p-6">
        <input
          className="rounded border p-3"
          name="title"
          defaultValue={post.title}
          placeholder="Title"
          required
        />
        <input
          className="rounded border p-3"
          name="slug"
          defaultValue={post.slug}
          placeholder="Slug"
          required
        />
        <input
          className="rounded border p-3"
          name="category"
          defaultValue={post.category}
          placeholder="Category"
          required
        />
        <textarea
          className="min-h-56 rounded border p-3"
          name="content"
          defaultValue={post.content}
          placeholder="Write your post..."
          required
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Save changes
        </button>
      </form>
    </main>
  );
}
