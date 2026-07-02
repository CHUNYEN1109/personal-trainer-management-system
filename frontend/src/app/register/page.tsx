"use client";

import { FormEvent, useState } from "react";
import { getCurrentUser, registerUser } from "@/lib/api/auth";
import type { CurrentUserResponse, UserRole } from "@/types/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { refreshCurrentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("CLIENT");
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );
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
      const authResponse = await registerUser({
        email,
        password,
        username,
        role,
      });

      localStorage.setItem("authToken", authResponse.token);

      await refreshCurrentUser();

      const user = await getCurrentUser(authResponse.token);

      setCurrentUser(user);
      setMessage("Register successful.");
    } catch (exception) {
      const errorMessage =
        exception instanceof Error ? exception.message : "Register failed.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <section className="rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Register</h1>

        <p className="mb-6 text-sm text-gray-600">
          Create a new client or trainer account.
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
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-1 block text-sm font-medium"
            >
              Username
            </label>

            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="test_client"
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
              minLength={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
              placeholder="password123"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-1 block text-sm font-medium">
              Role
            </label>

            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
            >
              <option value="CLIENT">Client</option>
              <option value="TRAINER">Trainer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Register"}
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
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-900">
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
