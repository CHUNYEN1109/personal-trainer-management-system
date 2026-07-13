"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  ClientPackage,
  createTrainerPackage,
  getTrainerClients,
  getTrainerPackages,
  TrainerClient,
} from "@/lib/api/api";

export default function TrainerPackagesPage() {
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [clientId, setClientId] = useState("");
  const [totalSessions, setTotalSessions] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("authToken");
  }

  async function loadPackages() {
    try {
      const token = getToken();

      if (!token) {
        setError("You must be logged in as a trainer to view packages.");
        return;
      }

      const data = await getTrainerPackages(token);
      setPackages(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load packages.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialData() {
      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setError("You must be logged in as a trainer to view packages.");
          }
          return;
        }

        const [packageData, clientData] = await Promise.all([
          getTrainerPackages(token),
          getTrainerClients(token),
        ]);

        if (isMounted) {
          setPackages(packageData);
          setClients(clientData);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load package data.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleCreatePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const token = getToken();

      if (!token) {
        setError("You must be logged in as a trainer to create packages.");
        return;
      }

      const parsedClientId = Number(clientId);
      const parsedTotalSessions = Number(totalSessions);

      if (!parsedClientId || parsedClientId <= 0) {
        setError("Please select a client.");
        return;
      }

      if (!parsedTotalSessions || parsedTotalSessions <= 0) {
        setError("Please enter a valid total sessions number.");
        return;
      }

      await createTrainerPackage(token, {
        clientId: parsedClientId,
        totalSessions: parsedTotalSessions,
      });

      setClientId("");
      setTotalSessions("");
      setSuccessMessage("Package created successfully.");

      await loadPackages();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create package.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Package Management</h1>
        <p className="mt-4 text-gray-600">Loading packages...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Package Management</h1>
      <p className="mt-2 text-gray-600">
        Create and manage training packages for your clients.
      </p>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Create Package</h2>

        {clients.length === 0 ? (
          <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium">No clients available.</p>
            <p className="mt-2">
              Add clients to your trainer client list before creating packages.
            </p>
            <Link
              href="/trainer/clients"
              className="mt-3 inline-block rounded-md bg-gray-900 px-4 py-2 text-white"
            >
              Go to Client Management
            </Link>
          </div>
        ) : (
          <form onSubmit={handleCreatePackage} className="mt-4 grid gap-4">
            <div>
              <label
                htmlFor="clientId"
                className="block text-sm font-medium text-gray-700"
              >
                Client
              </label>
              <select
                id="clientId"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.clientId}>
                    {client.clientUsername} - {client.clientEmail}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="totalSessions"
                className="block text-sm font-medium text-gray-700"
              >
                Total Sessions
              </label>
              <input
                id="totalSessions"
                type="number"
                min="1"
                value={totalSessions}
                onChange={(event) => setTotalSessions(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter total sessions"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-fit rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Package"}
            </button>
          </form>
        )}

        {successMessage && (
          <p className="mt-4 text-sm text-green-600">{successMessage}</p>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">Managed Packages</h2>

        {packages.length === 0 ? (
          <p className="mt-4 text-gray-600">
            You have not created any packages yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {packages.map((clientPackage) => (
              <div
                key={clientPackage.id}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Package #{clientPackage.id}
                  </h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                    {clientPackage.remainingSessions} remaining
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Client:</span>{" "}
                    {clientPackage.clientEmail}
                  </p>
                  <p>
                    <span className="font-medium">Client ID:</span>{" "}
                    {clientPackage.clientId}
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
        )}
      </section>
    </main>
  );
}
