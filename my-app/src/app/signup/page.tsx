"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setMessage("Signup successful. Check your email for a confirmation link.");
    setLoading(false);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold">Sign up</h1>

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
          minLength={6}
        />
        <button
          className="rounded bg-black px-4 py-3 font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign up"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-green-700">{message}</p> : null}

      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link className="underline" href="/login">
          Log in
        </Link>
      </p>
    </main>
  );
}
