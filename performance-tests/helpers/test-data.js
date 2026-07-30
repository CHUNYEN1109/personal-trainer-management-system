import { register } from "./auth.js";
import { authenticatedJsonRequest } from "./api.js";

export const smokeOptions = {
  vus: 1,
  iterations: 1,

  thresholds: {
    checks: ["rate==1"],
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1000"],
  },
};

export function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function futureLocalDateTime(minutesFromNow) {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return date.toISOString().slice(0, 19);
}

export function requireJsonId(response, label) {
  const id = response.json("id");

  if (typeof id !== "number") {
    throw new Error(`${label} did not return a numeric id`);
  }

  return id;
}

export function createUserPair(baseUrl, prefix = "k6-endpoint") {
  const suffix = uniqueSuffix();
  const shortSuffix = suffix.replace(/[^0-9]/g, "").slice(-10);
  const trainer = register(
    baseUrl,
    `${prefix}-trainer-${suffix}@example.com`,
    "K6test12345",
    `ktr-${shortSuffix}`,
    "TRAINER",
  );
  const client = register(
    baseUrl,
    `${prefix}-client-${suffix}@example.com`,
    "K6test12345",
    `kcl-${shortSuffix}`,
    "CLIENT",
  );

  if (!trainer || !client) {
    throw new Error("Test user setup failed");
  }

  return { trainer, client };
}

export function createTrainerClient(baseUrl, trainer, client) {
  const response = authenticatedJsonRequest(
    "POST",
    baseUrl,
    "/api/trainer/clients",
    trainer.token,
    {
      clientId: client.id,
    },
    "POST /api/trainer/clients",
    201,
    {
      "trainer client relationship is active": (res) =>
        res.json("status") === "ACTIVE",
    },
  );

  return {
    id: requireJsonId(response, "trainer client relationship"),
    response,
  };
}

export function createPackage(baseUrl, trainer, client, totalSessions = 3) {
  const relationship = createTrainerClient(baseUrl, trainer, client);
  const response = authenticatedJsonRequest(
    "POST",
    baseUrl,
    "/api/trainer/packages",
    trainer.token,
    {
      clientId: client.id,
      totalSessions,
    },
    "POST /api/trainer/packages",
    201,
    {
      "created package has expected total sessions": (res) =>
        res.json("totalSessions") === totalSessions,
      "created package has expected remaining sessions": (res) =>
        res.json("remainingSessions") === totalSessions,
    },
  );

  return {
    id: requireJsonId(response, "client package"),
    relationshipId: relationship.id,
    response,
  };
}

export function createProgressRecord(baseUrl, trainer, client) {
  createTrainerClient(baseUrl, trainer, client);

  const response = authenticatedJsonRequest(
    "POST",
    baseUrl,
    "/api/trainer/progress",
    trainer.token,
    {
      clientId: client.id,
      weight: 72.5,
      bodyFat: 18.2,
      dietSuggestion: "Keep protein intake steady during the test week.",
    },
    "POST /api/trainer/progress",
    201,
    {
      "created progress record belongs to client": (res) =>
        res.json("clientId") === client.id,
    },
  );

  return {
    id: requireJsonId(response, "progress record"),
    response,
  };
}

export function createSlot(baseUrl, trainer, minutesFromNow = 1440) {
  const response = authenticatedJsonRequest(
    "POST",
    baseUrl,
    "/api/trainer/slots",
    trainer.token,
    {
      startTime: futureLocalDateTime(minutesFromNow),
      endTime: futureLocalDateTime(minutesFromNow + 60),
    },
    "POST /api/trainer/slots",
    201,
    {
      "created slot is available": (res) => res.json("status") === "AVAILABLE",
    },
  );

  return {
    id: requireJsonId(response, "slot"),
    response,
  };
}

export function createBooking(baseUrl, client, slotId) {
  const response = authenticatedJsonRequest(
    "POST",
    baseUrl,
    "/api/client/bookings",
    client.token,
    {
      slotId,
    },
    "POST /api/client/bookings",
    201,
    {
      "created booking is pending": (res) => res.json("status") === "PENDING",
    },
  );

  return {
    id: requireJsonId(response, "booking"),
    response,
  };
}

export function createConfirmedBooking(baseUrl, trainer, client) {
  createPackage(baseUrl, trainer, client, 3);
  const slot = createSlot(baseUrl, trainer, 1560);
  const booking = createBooking(baseUrl, client, slot.id);

  authenticatedJsonRequest(
    "PATCH",
    baseUrl,
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

  return booking;
}
