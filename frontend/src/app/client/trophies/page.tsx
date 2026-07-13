"use client";

import { useEffect, useState } from "react";
import { getClientTrophies, Trophy } from "@/lib/api/api";

function formatTrophyType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ClientTrophiesPage() {
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("authToken");
  }

  useEffect(() => {
    let isMounted = true;

    async function loadTrophies() {
      try {
        const token = getToken();

        if (!token) {
          if (isMounted) {
            setError("You must be logged in as a client to view trophies.");
          }
          return;
        }

        const data = await getClientTrophies(token);

        if (isMounted) {
          setTrophies(data);
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error instanceof Error ? error.message : "Failed to load trophies.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTrophies();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Trophies</h1>
        <p className="mt-4 text-gray-600">Loading trophies...</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">My Trophies</h1>
      <p className="mt-2 text-gray-600">
        View the achievements you have earned from your training progress.
      </p>

      {error && (
        <section className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </section>
      )}

      {!error && trophies.length === 0 && (
        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-medium">No trophies yet</h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete training sessions and record your progress to start earning
            trophies.
          </p>
        </section>
      )}

      {!error && trophies.length > 0 && (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {trophies.map((trophy) => (
            <article
              key={trophy.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {formatTrophyType(trophy.type)}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{trophy.title}</h2>
                </div>

                <div className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                  Trophy
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-700">{trophy.description}</p>

              <div className="mt-5 border-t border-gray-100 pt-4 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-700">Awarded at:</span>{" "}
                  {new Date(trophy.awardedAt).toLocaleString()}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
