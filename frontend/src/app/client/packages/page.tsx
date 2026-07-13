"use client";

import { useEffect, useState } from "react";
import { ClientPackage, getClientPackages } from "@/lib/api/api";

export default function ClientPackagesPage() {
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPackages() {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("You must be logged in to view your packages.");
          return;
        }

        const data = await getClientPackages(token);
        setPackages(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load packages.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPackages();
  }, []);

  const totalPurchasedSessions = packages.reduce(
    (total, clientPackage) => total + clientPackage.totalSessions,
    0,
  );

  const totalRemainingSessions = packages.reduce(
    (total, clientPackage) => total + clientPackage.remainingSessions,
    0,
  );

  const usedSessions = totalPurchasedSessions - totalRemainingSessions;

  const activePackages = packages.filter(
    (clientPackage) => clientPackage.remainingSessions > 0,
  ).length;

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Packages</h1>
        <p className="mt-4 text-gray-600">Loading packages...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Packages</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">My Packages</h1>
      <p className="mt-2 text-gray-600">
        View your training packages and remaining sessions.
      </p>

      {packages.length === 0 ? (
        <p className="mt-6 text-gray-600">You do not have any packages yet.</p>
      ) : (
        <>
          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total purchased</p>
              <p className="mt-2 text-2xl font-semibold">
                {totalPurchasedSessions}
              </p>
              <p className="mt-1 text-sm text-gray-500">sessions</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Total remaining</p>
              <p className="mt-2 text-2xl font-semibold">
                {totalRemainingSessions}
              </p>
              <p className="mt-1 text-sm text-gray-500">sessions</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Used sessions</p>
              <p className="mt-2 text-2xl font-semibold">{usedSessions}</p>
              <p className="mt-1 text-sm text-gray-500">completed</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-gray-500">Active packages</p>
              <p className="mt-2 text-2xl font-semibold">{activePackages}</p>
              <p className="mt-1 text-sm text-gray-500">with sessions left</p>
            </div>
          </section>

          <div className="mt-6 grid gap-4">
            {packages.map((clientPackage) => (
              <div
                key={clientPackage.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">
                    Package #{clientPackage.id}
                  </h2>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {clientPackage.remainingSessions} remaining
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Trainer:</span>{" "}
                    {clientPackage.trainerEmail}
                  </p>
                  <p>
                    <span className="font-medium">Total sessions:</span>{" "}
                    {clientPackage.totalSessions}
                  </p>
                  <p>
                    <span className="font-medium">Remaining sessions:</span>{" "}
                    {clientPackage.remainingSessions}
                  </p>
                  <p>
                    <span className="font-medium">Created at:</span>{" "}
                    {new Date(clientPackage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
