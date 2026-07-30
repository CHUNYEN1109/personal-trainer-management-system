import { config } from "../../config/environment.js";
import { authenticatedGet, expectJsonArray } from "../../helpers/api.js";
import {
  createBooking,
  createSlot,
  createUserPair,
  smokeOptions,
} from "../../helpers/test-data.js";

export const options = smokeOptions;

export default function () {
  const { trainer, client } = createUserPair(config.baseUrl, "k6-trainer-bookings-get");
  const slot = createSlot(config.baseUrl, trainer, 1440);
  createBooking(config.baseUrl, client, slot.id);

  authenticatedGet(
    config.baseUrl,
    "/api/trainer/bookings",
    trainer.token,
    "GET /api/trainer/bookings",
    {
      "trainer bookings response is an array": expectJsonArray,
    },
  );
}
