import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/library/Button";
import { TextInput } from "../../components/library/TextInput";
import { supabase } from "../../utils/supabase";

export const Route = createFileRoute("/signup/")({
  component: SignupPage,
});

function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith("@dacit.co.uk")) {
      setError("Only @dacit.co.uk email addresses are allowed.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Check your email
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            We sent a confirmation link to{" "}
            <span className="font-medium text-gray-700">{email}</span>. Click it
            to activate your account.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => router.navigate({ to: "/login" })}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-gray-500">Get started today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextInput
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@dacit.co.uk"
          />

          <TextInput
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            hint="At least 8 characters"
          />

          <TextInput
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            error={
              confirmPassword && password !== confirmPassword
                ? "Passwords do not match"
                : undefined
            }
          />

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-gray-800 hover:text-gray-600 transition"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
