import http from "k6/http";
import { check, sleep } from "k6";

import { config } from "../config/environment.js";
import { login } from "../helpers/auth.js";

export const options = {
  stages: [
    { duration: "10s", target: 2 },
    { duration: "20s", target: 5 },
    { duration: "10s", target: 0 },
  ],

  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],

    "http_req_duration{name:POST /api/auth/login}": [
      "p(95)<1000",
    ],

    "http_req_duration{name:GET /api/auth/me}": [
      "p(95)<500",
    ],
  },
};

export function setup() {
  const result = login(
    config.baseUrl,
    config.trainer.email,
    config.trainer.password,
  );

  if (!result) {
    throw new Error("Setup failed: trainer login was unsuccessful");
  }

  return {
    token: result.token,
  };
}

export default function (data) {
  const response = http.get(
    `${config.baseUrl}/api/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
      tags: {
        name: "GET /api/auth/me",
      },
    },
  );

  check(response, {
    "current user returns 200": (res) => res.status === 200,

    "current user email matches trainer": (res) => {
      if (res.status !== 200 || !res.body) {
        return false;
      }

      try {
        return res.json("email") === config.trainer.email;
      } catch {
        return false;
      }
    },

    "current user role is TRAINER": (res) => {
      if (res.status !== 200 || !res.body) {
        return false;
      }

      try {
        return res.json("role") === "TRAINER";
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}