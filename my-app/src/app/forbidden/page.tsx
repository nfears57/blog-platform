import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">403 Forbidden</h1>
      <p className="text-zinc-700">
        You are logged in, but your account does not have admin access.
      </p>
      <div className="flex gap-3">
        <Link className="rounded border px-4 py-2" href="/">
          Go home
        </Link>
        <Link className="rounded bg-black px-4 py-2 text-white" href="/login">
          Switch account
        </Link>
      </div>
    </main>
  );
}
