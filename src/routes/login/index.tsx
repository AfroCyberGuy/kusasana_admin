import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../../components/library/Button";
import { TextInput } from "../../components/library/TextInput";
import { supabase } from "../../utils/supabase";

export const Route = createFileRoute("/login/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith("@dacit.co.uk")) {
      setError("Only @dacit.co.uk email addresses are allowed.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg px-8 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Kusasana Admin
          </h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
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

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Password
              </span>
              <a
                href="#"
                className="text-xs text-gray-500 hover:text-gray-700 transition"
              >
                Forgot password?
              </a>
            </div>
            <TextInput
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-medium text-gray-800 hover:text-gray-600 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
