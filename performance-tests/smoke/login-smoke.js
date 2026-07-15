import { config } from "../config/environment.js";
import { login } from "../helpers/auth.js";

export const options = {
  vus: 1,
  iterations: 1,

  thresholds: {
    checks: ["rate==1"],
    http_req_failed: ["rate<0.01"],

    "http_req_duration{name:POST /api/auth/login}": [
      "p(95)<1000",
    ],
  },
};

export default function () {
  const result = login(
    config.baseUrl,
    config.trainer.email,
    config.trainer.password,
  );

  if (!result) {
    throw new Error("Trainer login smoke test failed");
  }
}