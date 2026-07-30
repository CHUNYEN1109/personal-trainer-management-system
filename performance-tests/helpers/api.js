import http from "k6/http";
import { check } from "k6";

export function authenticatedGet(baseUrl, path, token, name, extraChecks = {}) {
  const response = http.get(
    `${baseUrl}${path}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      tags: {
        name,
      },
    },
  );

  check(response, {
    [`${name} returns 200`]: (res) => res.status === 200,

    [`${name} returns JSON`]: (res) => {
      if (res.status !== 200 || !res.body) {
        return false;
      }

      try {
        res.json();
        return true;
      } catch {
        return false;
      }
    },

    ...extraChecks,
  });

  return response;
}

export function authenticatedJsonRequest(
  method,
  baseUrl,
  path,
  token,
  body,
  name,
  expectedStatus,
  extraChecks = {},
) {
  const response = http.request(
    method,
    `${baseUrl}${path}`,
    body === undefined ? null : JSON.stringify(body),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      tags: {
        name,
      },
    },
  );

  check(response, {
    [`${name} returns ${expectedStatus}`]: (res) => res.status === expectedStatus,
    ...extraChecks,
  });

  return response;
}

export function expectStatus(response, status) {
  return response.status === status;
}

export function expectJsonArray(response) {
  if (response.status !== 200 || !response.body) {
    return false;
  }

  try {
    return Array.isArray(response.json());
  } catch {
    return false;
  }
}
