import Link from "next/link";

export default function SupportCancelPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Subscription canceled</h1>
      <p className="text-zinc-700">
        No worries - you can start your monthly supporter subscription anytime.
      </p>
      <Link className="w-fit rounded border px-4 py-2" href="/">
        Back to blog
      </Link>
    </main>
  );
}
