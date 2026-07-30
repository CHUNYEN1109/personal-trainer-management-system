import { check } from "k6";

import { config } from "../../config/environment.js";
import { authenticatedJsonRequest } from "../../helpers/api.js";
import {
  createSlot,
  createUserPair,
  requireJsonId,
  smokeOptions,
} from "../../helpers/test-data.js";

export const options = smokeOptions;

export default function () {
  const { trainer, client } = createUserPair(config.baseUrl, "k6-client-bookings-post");
  const slot = createSlot(config.baseUrl, trainer, 1440);
  const response = authenticatedJsonRequest(
    "POST",
    config.baseUrl,
    "/api/client/bookings",
    client.token,
    {
      slotId: slot.id,
    },
    "POST /api/client/bookings",
    201,
    {
      "booking belongs to created slot": (res) => res.json("slotId") === slot.id,
      "booking belongs to client": (res) => res.json("clientId") === client.id,
      "booking starts as pending": (res) => res.json("status") === "PENDING",
    },
  );

  const bookingId = requireJsonId(response, "booking");
  check(response, {
    "booking response contains numeric id": () => typeof bookingId === "number",
  });
}
