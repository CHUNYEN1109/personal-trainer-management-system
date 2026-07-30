import { config } from "../../config/environment.js";
import { authenticatedJsonRequest } from "../../helpers/api.js";
import {
  createBooking,
  createSlot,
  createUserPair,
  smokeOptions,
} from "../../helpers/test-data.js";

export const options = smokeOptions;

export default function () {
  const { trainer, client } = createUserPair(config.baseUrl, "k6-trainer-bookings-reject");
  const slot = createSlot(config.baseUrl, trainer, 1440);
  const booking = createBooking(config.baseUrl, client, slot.id);

  authenticatedJsonRequest(
    "PATCH",
    config.baseUrl,
    `/api/trainer/bookings/${booking.id}/reject`,
    trainer.token,
    {},
    "PATCH /api/trainer/bookings/{id}/reject",
    200,
    {
      "rejected booking status is REJECTED": (res) =>
        res.json("status") === "REJECTED",
    },
  );
}
