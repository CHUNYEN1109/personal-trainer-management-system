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
  const { trainer, client } = createUserPair(config.baseUrl, "k6-trainer-bookings-confirm");
  const slot = createSlot(config.baseUrl, trainer, 1440);
  const booking = createBooking(config.baseUrl, client, slot.id);

  authenticatedJsonRequest(
    "PATCH",
    config.baseUrl,
    `/api/trainer/bookings/${booking.id}/confirm`,
    trainer.token,
    {},
    "PATCH /api/trainer/bookings/{id}/confirm",
    200,
    {
      "confirmed booking status is CONFIRMED": (res) =>
        res.json("status") === "CONFIRMED",
    },
  );
}
