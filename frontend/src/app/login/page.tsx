"use client";

import { FormEvent, useState } from "react";
import { getCurrentUser, loginUser } from "@/lib/api/auth";
import type { CurrentUserResponse } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );
  const { refreshCurrentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setCurrentUser(null);
    setIsLoading(true);

    try {
      const authResponse = await loginUser({
        email,
        password,
      });

      localStorage.setItem("authToken", authResponse.token);

      await refreshCurrentUser();

      const user = await getCurrentUser(authResponse.token);

      setCurrentUser(user);
      setMessage("Login successful.");
    } catch (exception) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Login failed.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Login</h1>

        <p className="mb-6 text-sm text-gray-600">
          Sign in with your email and password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="trainer@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="password123"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {currentUser && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm">
            <p>
              <span className="font-medium">Email:</span> {currentUser.email}
            </p>
            <p>
              <span className="font-medium">Username:</span>{" "}
              {currentUser.username}
            </p>
            <p>
              <span className="font-medium">Role:</span> {currentUser.role}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
