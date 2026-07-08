export type TrainingSlotStatus = "AVAILABLE" | "BOOKED" | "CANCELLED";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export type TrainingSlotResponse = {
  id: number;
  trainerId: number;
  trainerEmail: string;
  startTime: string;
  endTime: string;
  status: TrainingSlotStatus;
  createdAt: string;
};

export type CreateBookingRequest = {
  slotId: number;
};

export type BookingResponse = {
  id: number;
  clientId: number;
  clientEmail: string;
  slotId: number;
  trainerId: number;
  trainerEmail: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  createdAt: string;
};