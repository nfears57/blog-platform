"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Log in</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          className="rounded border p-3"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          className="rounded border p-3"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button
          className="rounded bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <p className="text-sm text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link className="underline" href="/signup">
          Sign up
        </Link>
      </p>
    </main>
  );
}
