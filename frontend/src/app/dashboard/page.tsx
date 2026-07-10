"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !currentUser) {
      router.push("/login");
      return;
    }

    if (currentUser.role === "CLIENT") {
      router.push("/client/dashboard");
      return;
    }

    if (currentUser.role === "TRAINER") {
      router.push("/trainer/dashboard");
      return;
    }

    router.push("/unauthorized");
  }, [currentUser, isAuthenticated, isLoading, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
      <p>Redirecting to your dashboard...</p>
    </main>
  );
}
