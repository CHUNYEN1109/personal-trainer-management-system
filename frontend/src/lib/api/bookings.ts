import type {
  BookingResponse,
  CreateBookingRequest,
  TrainingSlotResponse,
  CreateTrainingSlotRequest,
} from "@/types/bookings";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    const message =
      errorBody?.message ||
      errorBody?.error ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createTrainingSlot(
  token: string,
  data: CreateTrainingSlotRequest,
): Promise<TrainingSlotResponse> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/slots`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse<TrainingSlotResponse>(response);
}

export async function getTrainerSlots(
  token: string,
): Promise<TrainingSlotResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/slots`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse<TrainingSlotResponse[]>(response);
}

export async function cancelTrainingSlot(
  token: string,
  slotId: number,
): Promise<TrainingSlotResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/trainer/slots/${slotId}/cancel`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  return handleResponse<TrainingSlotResponse>(response);
}

export async function getAvailableSlots(
  token: string,
): Promise<TrainingSlotResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/slots/available`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse<TrainingSlotResponse[]>(response);
}

export async function createBooking(
  token: string,
  data: CreateBookingRequest,
): Promise<BookingResponse> {
  const response = await fetch(`${API_BASE_URL}/api/client/bookings`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse<BookingResponse>(response);
}

export async function getClientBookings(
  token: string,
): Promise<BookingResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/client/bookings`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse<BookingResponse[]>(response);
}

export async function getTrainerBookings(
  token: string,
): Promise<BookingResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/trainer/bookings`, {
    method: "GET",
    headers: authHeaders(token),
  });

  return handleResponse<BookingResponse[]>(response);
}

export async function confirmBooking(
  token: string,
  bookingId: number,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/trainer/bookings/${bookingId}/confirm`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  return handleResponse<BookingResponse>(response);
}

export async function rejectBooking(
  token: string,
  bookingId: number,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/trainer/bookings/${bookingId}/reject`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  return handleResponse<BookingResponse>(response);
}

export async function completeBooking(
  token: string,
  bookingId: number,
): Promise<BookingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/trainer/bookings/${bookingId}/complete`,
    {
      method: "PATCH",
      headers: authHeaders(token),
    },
  );

  return handleResponse<BookingResponse>(response);
}

