"use client";

import { useEffect, useState } from "react";
import { getClientProgressRecords, ProgressRecord } from "@/lib/api/api";

export default function ClientProgressPage() {
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgressRecords() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("You must be logged in to view your progress records.");
          return;
        }

        const data = await getClientProgressRecords(token);
        setProgressRecords(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load progress records.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProgressRecords();
  }, []);

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Progress</h1>
        <p className="mt-4 text-gray-600">Loading progress records...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">My Progress</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">My Progress</h1>
      <p className="mt-2 text-gray-600">
        View your progress records from your trainer.
      </p>

      {progressRecords.length === 0 ? (
        <p className="mt-6 text-gray-600">
          You do not have any progress records yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
          {progressRecords.map((record) => (
            <div
              key={record.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">
                  Progress Record #{record.id}
                </h2>
                <span className="text-sm text-gray-500">
                  {new Date(record.recordedAt).toLocaleString()}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Trainer:</span>{" "}
                  {record.trainerEmail}
                </p>
                <p>
                  <span className="font-medium">Weight:</span>{" "}
                  {record.weight ?? "Not recorded"}
                </p>
                <p>
                  <span className="font-medium">Body fat:</span>{" "}
                  {record.bodyFat ?? "Not recorded"}
                </p>
                <p>
                  <span className="font-medium">Diet suggestion:</span>{" "}
                  {record.dietSuggestion || "No suggestion provided."}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
