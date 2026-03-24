import Link from "next/link";
import { createPost } from "../actions";
import { requireAdmin } from "@/lib/auth";

export default async function NewPostPage() {
  await requireAdmin();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-14">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Create post</h1>
        <Link className="text-sm underline" href="/admin">
          Back to admin
        </Link>
      </div>

      <form action={createPost} className="grid gap-4 rounded border p-6">
        <input className="rounded border p-3" name="title" placeholder="Title" required />
        <input className="rounded border p-3" name="slug" placeholder="Slug (optional)" />
        <input className="rounded border p-3" name="category" placeholder="Category" required />
        <textarea
          className="min-h-56 rounded border p-3"
          name="content"
          placeholder="Write your post..."
          required
        />
        <button className="rounded bg-black px-4 py-2 text-white" type="submit">
          Publish post
        </button>
      </form>
    </main>
  );
}
