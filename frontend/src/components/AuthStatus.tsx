"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthStatus() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  if (isLoading) {
    return (
      <p className="text-sm text-[#E0E0E0]">
        Checking authentication status...
      </p>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <p className="text-sm text-[#E0E0E0]">You are not logged in yet.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-[#E0E0E0]">
        Signed in as{" "}
        <span className="font-semibold text-white">{currentUser.email}</span>
      </p>

      <p className="text-xs uppercase tracking-wide text-cyan-300">
        Role: {currentUser.role}
      </p>

      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300 hover:bg-white/10"
      >
        Logout
      </button>
    </div>
  );
}
