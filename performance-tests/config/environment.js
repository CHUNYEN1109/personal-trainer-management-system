export const config = {
  baseUrl: __ENV.BASE_URL || "http://localhost:8080",

  trainer: {
    email: __ENV.TRAINER_EMAIL,
    password: __ENV.TRAINER_PASSWORD,
  },
};