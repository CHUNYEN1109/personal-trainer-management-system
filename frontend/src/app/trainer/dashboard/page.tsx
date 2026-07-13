"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ClientPackage,
  getTrainerClients,
  getTrainerPackages,
  TrainerClient,
} from "@/lib/api/api";

export default function TrainerDashboardPage() {
  const router = useRouter();
  const { currentUser, isAuthenticated, isLoading, logout } = useAuth();
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [packageSummaryError, setPackageSummaryError] = useState("");
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clientSummaryError, setClientSummaryError] = useState("");

  function getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("authToken");
  }

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (currentUser?.role !== "TRAINER") {
      router.push("/unauthorized");
    }
  }, [currentUser, isAuthenticated, isLoading, router]);

  useEffect(() => {
    let isMounted = true;

    async function loadPackageSummary() {
      if (isLoading || !isAuthenticated || currentUser?.role !== "TRAINER") {
        if (!isLoading && isMounted) {
          setIsLoadingPackages(false);
        }
        return;
      }

      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setPackageSummaryError("Unable to load package summary.");
          }
          return;
        }

        const data = await getTrainerPackages(token);

        if (isMounted) {
          setPackages(data);
        }
      } catch {
        if (isMounted) {
          setPackageSummaryError("Unable to load package summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingPackages(false);
        }
      }
    }

    void loadPackageSummary();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isAuthenticated, isLoading]);

  useEffect(() => {
    let isMounted = true;

    async function loadClientSummary() {
      if (isLoading || !isAuthenticated || currentUser?.role !== "TRAINER") {
        if (!isLoading && isMounted) {
          setIsLoadingClients(false);
        }
        return;
      }

      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setClientSummaryError("Unable to load client summary.");
          }
          return;
        }

        const data = await getTrainerClients(token);

        if (isMounted) {
          setClients(data);
        }
      } catch {
        if (isMounted) {
          setClientSummaryError("Unable to load client summary.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingClients(false);
        }
      }
    }

    void loadClientSummary();

    return () => {
      isMounted = false;
    };
  }, [currentUser, isAuthenticated, isLoading]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const totalPackages = packages.length;
  const totalSessionsSold = packages.reduce(
    (total, clientPackage) => total + clientPackage.totalSessions,
    0,
  );
  const totalRemainingSessions = packages.reduce(
    (total, clientPackage) => total + clientPackage.remainingSessions,
    0,
  );
  const totalUsedSessions = totalSessionsSold - totalRemainingSessions;
  const totalClients = clients.length;
  const activeClients = clients.filter(
    (client) => client.status === "ACTIVE",
  ).length;
  const inactiveClients = clients.filter(
    (client) => client.status !== "ACTIVE",
  ).length;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Checking authentication status...</p>
      </main>
    );
  }

  if (!isAuthenticated || !currentUser || currentUser.role !== "TRAINER") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 text-center text-[#E0E0E0]">
        <p>Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B192C] px-6 py-12 text-[#E0E0E0]">
      <section className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#1A1A1A]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-cyan-300">
          Trainer Dashboard
        </p>

        <h1 className="mb-4 text-3xl font-semibold text-white">
          Welcome, {currentUser.username}
        </h1>

        <p className="mb-8 text-sm leading-6 text-[#E0E0E0]">
          This is the trainer dashboard. Trainers can create available slots,
          manage client bookings, review packages, and track client progress
          here.
        </p>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/trainer/slots"
            className="rounded-lg bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-[#0B192C] transition hover:bg-cyan-200"
          >
            Manage Slots
          </Link>

          <Link
            href="/trainer/bookings"
            className="rounded-lg border border-cyan-300/40 px-5 py-3 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-300/10"
          >
            Manage Bookings
          </Link>

          <Link
            href="/trainer/packages"
            className="rounded-lg border border-cyan-300/40 px-5 py-3 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-300/10"
          >
            Manage Packages
          </Link>

          <Link
            href="/trainer/progress"
            className="rounded-lg border border-cyan-300/40 px-5 py-3 text-center text-sm font-semibold text-cyan-300 transition hover:bg-cyan-300/10"
          >
            Manage Progress
          </Link>
        </div>

        <Link
          href="/trainer/packages"
          className="mb-8 block rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-5 transition hover:border-cyan-300 hover:bg-cyan-300/15"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                  Package Summary
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {isLoadingPackages
                    ? "Loading packages..."
                    : packageSummaryError
                      ? "Package summary unavailable"
                      : `${totalPackages} packages created`}
                </h2>

                <p className="mt-2 text-sm text-[#E0E0E0]">
                  Review sold sessions, remaining sessions, and package usage.
                </p>
              </div>

              <span className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#0B192C]">
                View packages
              </span>
            </div>

            {!isLoadingPackages && !packageSummaryError && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Packages</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalPackages}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Sessions sold</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalSessionsSold}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Remaining</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalRemainingSessions}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Used</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalUsedSessions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Link>

        <Link
          href="/trainer/clients"
          className="mb-8 block rounded-lg border border-cyan-300/30 bg-white/5 p-5 transition hover:border-cyan-300 hover:bg-white/10"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                  Client Summary
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {isLoadingClients
                    ? "Loading clients..."
                    : clientSummaryError
                      ? "Client summary unavailable"
                      : `${totalClients} assigned clients`}
                </h2>

                <p className="mt-2 text-sm text-[#E0E0E0]">
                  Review assigned clients, active relationships, and inactive
                  clients.
                </p>
              </div>

              <span className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#0B192C]">
                View clients
              </span>
            </div>

            {!isLoadingClients && !clientSummaryError && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Total clients</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {totalClients}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Active</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {activeClients}
                  </p>
                </div>

                <div className="rounded-lg border border-white/10 bg-[#0B192C]/60 px-4 py-3">
                  <p className="text-xs text-[#E0E0E0]">Inactive</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {inactiveClients}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Link>

        <div className="mb-8 rounded-lg border border-white/10 bg-white/5 p-5">
          <p className="mb-2 text-sm">
            <span className="font-semibold text-white">Email:</span>{" "}
            {currentUser.email}
          </p>

          <p className="mb-2 text-sm">
            <span className="font-semibold text-white">Username:</span>{" "}
            {currentUser.username}
          </p>

          <p className="text-sm">
            <span className="font-semibold text-white">Role:</span>{" "}
            {currentUser.role}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg border border-white/20 px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:border-cyan-300 hover:bg-white/10"
          >
            Back to home
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#0B192C] transition hover:bg-[#E0E0E0]"
          >
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}
