export type UserRole = "CLIENT" | "TRAINER";
export type AuthProvider = "LOCAL" | "GOOGLE";

export type RegisterRequest = {
  email: string;
  password: string;
  username: string;
  role: UserRole;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  provider: AuthProvider;
  token: string;
};

export type CurrentUserResponse = {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  provider: AuthProvider;
};