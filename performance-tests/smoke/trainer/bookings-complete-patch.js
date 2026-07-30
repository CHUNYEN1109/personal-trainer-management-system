import { config } from "../../config/environment.js";
import { authenticatedJsonRequest } from "../../helpers/api.js";
import {
  createConfirmedBooking,
  createUserPair,
  smokeOptions,
} from "../../helpers/test-data.js";

export const options = smokeOptions;

export default function () {
  const { trainer, client } = createUserPair(config.baseUrl, "k6-trainer-bookings-complete");
  const booking = createConfirmedBooking(config.baseUrl, trainer, client);

  authenticatedJsonRequest(
    "PATCH",
    config.baseUrl,
    `/api/trainer/bookings/${booking.id}/complete`,
    trainer.token,
    {},
    "PATCH /api/trainer/bookings/{id}/complete",
    200,
    {
      "completed booking status is COMPLETED": (res) =>
        res.json("status") === "COMPLETED",
    },
  );
}
