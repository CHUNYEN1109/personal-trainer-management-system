const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type ClientPackage = {
  id: number;
  clientId: number;
  clientEmail: string;
  trainerId: number;
  trainerEmail: string;
  totalSessions: number;
  remainingSessions: number;
  createdAt: string;
};

export type CreateClientPackageRequest = {
  clientId: number;
  totalSessions: number;
};

export async function createTrainerPackage(
  token: string,
  request: CreateClientPackageRequest
): Promise<ClientPackage> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/packages`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });

  return handleResponse<ClientPackage>(response);
}

export async function getTrainerPackages(
  token: string
): Promise<ClientPackage[]> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/packages`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse<ClientPackage[]>(response);
}

export async function getClientPackages(
  token: string
): Promise<ClientPackage[]> {
  const response = await fetch(`${API_BASE_URL}/api/client/packages`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse<ClientPackage[]>(response);
}

export type ProgressRecord = {
  id: number;
  clientId: number;
  clientEmail: string;
  trainerId: number;
  trainerEmail: string;
  weight: number | null;
  bodyFat: number | null;
  dietSuggestion: string | null;
  recordedAt: string;
};

export type CreateProgressRecordRequest = {
  clientId: number;
  weight?: number;
  bodyFat?: number;
  dietSuggestion?: string;
};

export async function createTrainerProgressRecord(
  token: string,
  request: CreateProgressRecordRequest
): Promise<ProgressRecord> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/progress`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });

  return handleResponse<ProgressRecord>(response);
}

export async function getTrainerProgressRecords(
  token: string
): Promise<ProgressRecord[]> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/progress`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse<ProgressRecord[]>(response);
}

export async function getClientProgressRecords(
  token: string
): Promise<ProgressRecord[]> {
  const response = await fetch(`${API_BASE_URL}/api/client/progress`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  return handleResponse<ProgressRecord[]>(response);
}