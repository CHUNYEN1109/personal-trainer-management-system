export const config = {
  baseUrl: (__ENV.BASE_URL || "http://localhost:8080").replace(/\/$/, ""),

  trainer: {
    email: __ENV.TRAINER_EMAIL,
    password: __ENV.TRAINER_PASSWORD,
  },

  client: {
    email: __ENV.CLIENT_EMAIL,
    password: __ENV.CLIENT_PASSWORD,
  },
};
