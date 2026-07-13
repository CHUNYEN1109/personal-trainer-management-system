"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addTrainerClient,
  deactivateTrainerClient,
  getTrainerClients,
  TrainerClient,
} from "@/lib/api/api";

export default function TrainerClientsPage() {
  const [clients, setClients] = useState<TrainerClient[]>([]);
  const [clientId, setClientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivatingClientId, setDeactivatingClientId] = useState<
    number | null
  >(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("authToken");
  }

  async function loadClients() {
    try {
      const token = getToken();

      if (!token) {
        setError("You must be logged in as a trainer to view clients.");
        return;
      }

      const data = await getTrainerClients(token);
      setClients(data);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to load clients.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialClients() {
      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setError("You must be logged in as a trainer to view clients.");
          }
          return;
        }

        const data = await getTrainerClients(token);

        if (isMounted) {
          setClients(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Failed to load clients.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialClients();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const token = getToken();

      if (!token) {
        setError("You must be logged in as a trainer to add clients.");
        return;
      }

      const parsedClientId = Number(clientId);

      if (!parsedClientId || parsedClientId <= 0) {
        setError("Please enter a valid client ID.");
        return;
      }

      await addTrainerClient(token, {
        clientId: parsedClientId,
      });

      setClientId("");
      setSuccessMessage("Client added successfully.");

      await loadClients();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add client.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeactivateClient(trainerClientId: number) {
    setError("");
    setSuccessMessage("");
    setDeactivatingClientId(trainerClientId);

    try {
      const token = getToken();

      if (!token) {
        setError("You must be logged in as a trainer to deactivate clients.");
        return;
      }

      await deactivateTrainerClient(token, trainerClientId);

      setSuccessMessage("Client deactivated successfully.");

      await loadClients();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to deactivate client.",
      );
    } finally {
      setDeactivatingClientId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Client Management</h1>
        <p className="mt-4 text-gray-600">Loading clients...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Client Management</h1>
      <p className="mt-2 text-gray-600">
        View and manage the clients assigned to your trainer account.
      </p>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium">Add Client</h2>

        <form onSubmit={handleAddClient} className="mt-4 grid gap-4">
          <div>
            <label
              htmlFor="clientId"
              className="block text-sm font-medium text-gray-700"
            >
              Client ID
            </label>
            <input
              id="clientId"
              type="number"
              min="1"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter client ID"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-fit rounded-md bg-gray-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {isSubmitting ? "Adding..." : "Add Client"}
          </button>
        </form>

        {successMessage && (
          <p className="mt-4 text-sm text-green-600">{successMessage}</p>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-medium">My Clients</h2>

        {clients.length === 0 ? (
          <p className="mt-4 text-gray-600">
            You have not added any clients yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {clients.map((client) => {
              const isActive = client.status === "ACTIVE";
              const isDeactivating = deactivatingClientId === client.id;

              return (
                <div
                  key={client.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-medium">
                      {client.clientUsername}
                    </h3>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                      {client.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Client email:</span>{" "}
                      {client.clientEmail}
                    </p>
                    <p>
                      <span className="font-medium">Client ID:</span>{" "}
                      {client.clientId}
                    </p>
                    <p>
                      <span className="font-medium">Trainer email:</span>{" "}
                      {client.trainerEmail}
                    </p>
                    <p>
                      <span className="font-medium">Added at:</span>{" "}
                      {new Date(client.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-4">
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => void handleDeactivateClient(client.id)}
                        disabled={isDeactivating}
                        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                      >
                        {isDeactivating ? "Deactivating..." : "Deactivate"}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">
                        This client relationship is inactive.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
