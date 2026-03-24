import Link from "next/link";

export default function SupportSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-semibold">Thank you for supporting!</h1>
      <p className="text-zinc-700">
        Your monthly supporter subscription was started successfully.
      </p>
      <Link className="w-fit rounded border px-4 py-2" href="/">
        Back to blog
      </Link>
    </main>
  );
}
