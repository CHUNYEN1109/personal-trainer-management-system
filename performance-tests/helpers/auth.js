import http from "k6/http";
import { check } from "k6";

export function login(baseUrl, email, password) {
  if (!email || !password) {
    throw new Error(
      "TRAINER_EMAIL and TRAINER_PASSWORD environment variables are required",
    );
  }

  const payload = JSON.stringify({
    email,
    password,
  });

  const response = http.post(
    `${baseUrl}/api/auth/login`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      tags: {
        name: "POST /api/auth/login",
      },
    },
  );

  const loginPassed = check(response, {
    "login returns 200": (res) => res.status === 200,

    "login response contains token": (res) => {
      if (res.status !== 200 || !res.body) {
        return false;
      }

      try {
        const token = res.json("token");
        return typeof token === "string" && token.length > 0;
      } catch {
        return false;
      }
    },

    "login response role is TRAINER": (res) => {
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

  if (!loginPassed || response.status !== 200) {
    console.error(
      `Login failed. Status: ${response.status}, body: ${response.body}`,
    );

    return null;
  }

  const token = response.json("token");

  return {
    token,
    response,
  };
}