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
  const { trainer, client } = createUserPair(config.baseUrl, "k6-client-bookings-cancel");
  const slot = createSlot(config.baseUrl, trainer, 1440);
  const booking = createBooking(config.baseUrl, client, slot.id);

  authenticatedJsonRequest(
    "PATCH",
    config.baseUrl,
    `/api/client/bookings/${booking.id}/cancel`,
    client.token,
    {},
    "PATCH /api/client/bookings/{id}/cancel",
    200,
    {
      "client cancelled booking status is CANCELLED": (res) =>
        res.json("status") === "CANCELLED",
    },
  );
}
