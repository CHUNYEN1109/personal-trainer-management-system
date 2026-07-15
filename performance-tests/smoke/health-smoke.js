import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    checks: ["rate==1"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:8080";

export default function () {
  const response = http.get(`${BASE_URL}/actuator/health`);

  check(response, {
    "health endpoint returns 200": (res) => res.status === 200,

    "backend status is UP": (res) => {
      if (res.status !== 200 || !res.body) {
        return false;
      }

      try {
        return res.json("status") === "UP";
      } catch {
        return false;
      }
    },
  });
}