# k6 Backend Performance Tests

This directory contains the k6 performance-testing MVP for the Spring Boot backend of the Personal Trainer Management System.

The current test suite covers:

- Backend health availability
- Trainer authentication
- JWT validation
- Authenticated read-only API load testing

## Project structure

```text
performance-tests/
├── README.md
├── config/
│   └── environment.js
├── helpers/
│   └── auth.js
├── smoke/
│   ├── health-smoke.js
│   └── login-smoke.js
└── load/
    └── authenticated-api-load.js
```

## Prerequisites

Before running the tests, make sure the following tools and services are available:

- k6
- Java 21
- MySQL
- Spring Boot backend
- A valid trainer test account

Check the installed k6 version:

```bash
k6 version
```

On macOS, k6 can be installed with Homebrew:

```bash
brew install k6
```

## Start the backend

From the repository root:

```bash
cd backend
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

Keep the backend running while executing the k6 tests.

Confirm that the backend is available:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{
  "status": "UP"
}
```

## Environment variables

The tests use environment variables instead of storing credentials in source control.

| Variable           | Description                   | Example                 |
| ------------------ | ----------------------------- | ----------------------- |
| `BASE_URL`         | Spring Boot backend URL       | `http://localhost:8080` |
| `TRAINER_EMAIL`    | Trainer test account email    | `trainer@example.com`   |
| `TRAINER_PASSWORD` | Trainer test account password | Local test password     |

> Do not commit real passwords, JWT tokens, database credentials, or production secrets.

## Health smoke test

The health smoke test checks that:

- The backend is reachable
- `GET /actuator/health` returns HTTP `200`
- The backend status is `UP`
- The response time remains below the configured threshold

Run from the repository root:

```bash
k6 run performance-tests/smoke/health-smoke.js
```

Run with an explicit backend URL:

```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  performance-tests/smoke/health-smoke.js
```

## Trainer login smoke test

The login smoke test checks that:

- `POST /api/auth/login` returns HTTP `200`
- The response contains a JWT token
- The authenticated user role is `TRAINER`
- The login response time remains below the configured threshold

Run:

```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  -e TRAINER_EMAIL=trainer@example.com \
  -e TRAINER_PASSWORD='your-local-test-password' \
  performance-tests/smoke/login-smoke.js
```

## Authenticated API load test

The authenticated load test:

1. Logs in once during the k6 `setup()` phase
2. Extracts the JWT token
3. Sends authenticated requests to `GET /api/auth/me`
4. Gradually increases the load to five virtual users
5. Validates the returned trainer identity and role

Run:

```bash
k6 run \
  -e BASE_URL=http://localhost:8080 \
  -e TRAINER_EMAIL=trainer@example.com \
  -e TRAINER_PASSWORD='your-local-test-password' \
  performance-tests/load/authenticated-api-load.js
```

## Current load profile

The authenticated load test uses the following stages:

| Duration   | Target virtual users | Purpose                    |
| ---------- | -------------------: | -------------------------- |
| 10 seconds |                    2 | Ramp up                    |
| 20 seconds |                    5 | Maintain and increase load |
| 10 seconds |                    0 | Ramp down                  |

A one-second sleep is included between iterations to simulate a basic user pause and avoid generating an unrealistic request loop.

## Current thresholds

### Health test

- Check success rate must be `100%`
- HTTP request failure rate must be below `1%`
- 95% of health requests must complete in under `500 ms`

### Login test

- Check success rate must be `100%`
- HTTP request failure rate must be below `1%`
- 95% of login requests must complete in under `1000 ms`

### Authenticated API load test

- Check success rate must be above `99%`
- HTTP request failure rate must be below `1%`
- 95% of login requests must complete in under `1000 ms`
- 95% of `GET /api/auth/me` requests must complete in under `500 ms`

If a threshold is exceeded, k6 exits with a failure status.

## Understanding the results

Important k6 metrics include:

### `checks`

Shows whether response validations passed.

Example:

```text
checks: 100.00%
```

### `http_req_failed`

Shows the percentage of failed HTTP requests.

Example:

```text
http_req_failed: 0.00%
```

### `http_req_duration`

Shows request response times.

Important values include:

- `avg`: average response time
- `med`: median response time
- `p(90)`: 90% of requests completed below this value
- `p(95)`: 95% of requests completed below this value
- `max`: slowest request

The `p(95)` value is generally more useful than the average because it reveals how most users experience the API while still including slower requests.

### `iterations`

Shows how many times the default test function completed.

### `vus`

Shows the number of active virtual users.

### `http_reqs`

Shows the total number of HTTP requests sent.

## Initial MVP results

The initial local authenticated API load test completed successfully with:

| Metric                       |               Result |
| ---------------------------- | -------------------: |
| Maximum virtual users        |                    5 |
| Completed iterations         |                  101 |
| HTTP requests                |                  102 |
| Failed requests              |                   0% |
| Checks passed                |            306 / 306 |
| `GET /api/auth/me` p(95)     |  Approximately 20 ms |
| `POST /api/auth/login` p(95) | Approximately 111 ms |

> These numbers are local development results and should not be treated as production capacity measurements.

## Safety notes

- Do not run load tests against production without explicit approval
- Use dedicated test accounts
- Prefer read-only endpoints during early load testing
- Avoid committing credentials or JWT tokens
- Avoid using real customer data
- Start with small loads and increase gradually
- Monitor the backend and database while testing

## Current limitations

The MVP currently:

- Uses one trainer account
- Shares one JWT token across load-test virtual users
- Tests only one authenticated read-only endpoint
- Runs locally
- Does not test the Next.js UI
- Does not include stress, spike, or soak testing
- Does not export metrics to Grafana or another monitoring platform

## Future improvements

Possible next steps include:

- Add separate trainer and client scenarios
- Add multiple test accounts
- Add trainer dashboard read tests
- Add booking workflow tests
- Add concurrent booking tests
- Add stress and spike scenarios
- Add test-data setup and cleanup
- Add GitHub Actions smoke testing
- Export metrics to Grafana Cloud or Prometheus
- Add browser-level testing for selected UI journeys
