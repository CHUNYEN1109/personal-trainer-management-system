# k6 Booking Smoke Tests

This directory contains k6 smoke tests for the booking functions in the Spring
Boot backend of the Personal Trainer Management System.

The smoke tests are organized by user role:

- `smoke/client/` covers client booking actions
- `smoke/trainer/` covers trainer booking actions

Non-booking endpoints are used only as setup helpers when a booking flow needs
temporary users or slots. They are not standalone smoke or load test targets.

## Project structure

```text
performance-tests/
├── README.md
├── config/
│   └── environment.js
├── helpers/
│   ├── api.js
│   ├── auth.js
│   └── test-data.js
├── run-all.sh
└── smoke/
    ├── client/
    │   ├── bookings-cancel-patch.js
    │   ├── bookings-get.js
    │   └── bookings-post.js
    └── trainer/
        ├── bookings-complete-patch.js
        ├── bookings-confirm-patch.js
        ├── bookings-get.js
        └── bookings-reject-patch.js
```

## Prerequisites

- k6
- Java 21 or later
- MySQL
- Spring Boot backend

Start the backend from the repository root:

```bash
cd backend
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

Confirm the backend is available:

```bash
curl http://localhost:8080/actuator/health
```

## Environment variables

| Variable   | Description             | Default                 |
| ---------- | ----------------------- | ----------------------- |
| `BASE_URL` | Spring Boot backend URL | `http://localhost:8080` |

Do not commit real passwords, JWT tokens, database credentials, or production
secrets. These smoke tests create disposable `k6-*` users and records for each
run.

## Run all tests

From the repository root:

```bash
./performance-tests/run-all.sh
```

`run-all.sh` automatically runs every booking smoke test under `smoke/client/`
and `smoke/trainer/`.

## Run one booking test

Each booking API has its own k6 file. Example:

```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  performance-tests/smoke/client/bookings-post.js
```

## Client Booking Smoke Tests

| File | API |
| ---- | --- |
| `smoke/client/bookings-post.js` | `POST /api/client/bookings` |
| `smoke/client/bookings-get.js` | `GET /api/client/bookings` |
| `smoke/client/bookings-cancel-patch.js` | `PATCH /api/client/bookings/{bookingId}/cancel` |

## Trainer Booking Smoke Tests

| File | API |
| ---- | --- |
| `smoke/trainer/bookings-get.js` | `GET /api/trainer/bookings` |
| `smoke/trainer/bookings-confirm-patch.js` | `PATCH /api/trainer/bookings/{bookingId}/confirm` |
| `smoke/trainer/bookings-reject-patch.js` | `PATCH /api/trainer/bookings/{bookingId}/reject` |
| `smoke/trainer/bookings-complete-patch.js` | `PATCH /api/trainer/bookings/{bookingId}/complete` |

## Thresholds

- Booking smoke tests require `100%` checks passing
- Booking smoke tests require `http_req_failed < 1%`
- Booking smoke tests require request p95 below `1000 ms`

If a threshold is exceeded, k6 exits with a failure status.

## Recommendation

Keep booking flows as smoke tests first. Booking endpoints mutate data and have
state transitions, so broad load testing can create noisy results unless the
database is seeded and cleaned in a controlled way.

If booking performance testing is needed later, add a separate low-rate scenario
that uses seeded slots and explicit cleanup. That keeps smoke tests fast while
still giving useful performance data.

## Safety notes

- Do not run these tests against production without explicit approval
- Avoid committing credentials or JWT tokens
- Avoid using real customer data
- Reset or clean the local database when repeated test data becomes noisy
