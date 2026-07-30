import http from "k6/http";
import { check } from "k6";

export function login(baseUrl, email, password, expectedRole = "TRAINER") {
  if (!email || !password) {
    throw new Error(
      "Email and password are required for login",
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

    [`login response role is ${expectedRole}`]: (res) => {
      if (res.status !== 200 || !res.body) {
        return false;
      }

      try {
        return res.json("role") === expectedRole;
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

export function register(baseUrl, email, password, username, role) {
  const payload = JSON.stringify({
    email,
    password,
    username,
    role,
  });

  const response = http.post(
    `${baseUrl}/api/auth/register`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      tags: {
        name: "POST /api/auth/register",
      },
    },
  );

  const registerPassed = check(response, {
    [`register ${role} returns 201`]: (res) => res.status === 201,

    [`register response role is ${role}`]: (res) => {
      if (res.status !== 201 || !res.body) {
        return false;
      }

      try {
        return res.json("role") === role;
      } catch {
        return false;
      }
    },

    "register response contains token": (res) => {
      if (res.status !== 201 || !res.body) {
        return false;
      }

      try {
        const token = res.json("token");
        return typeof token === "string" && token.length > 0;
      } catch {
        return false;
      }
    },
  });

  if (!registerPassed || response.status !== 201) {
    console.error(
      `Registration failed. Status: ${response.status}, body: ${response.body}`,
    );

    return null;
  }

  return {
    id: response.json("id"),
    email: response.json("email"),
    role: response.json("role"),
    token: response.json("token"),
    response,
  };
}
