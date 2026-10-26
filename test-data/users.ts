import { environment } from "../config/environment";
import type { LoginCredentials } from "../pages/LoginPage";

export const users = {
  admin: {
    username: environment.auth.username,
    password: environment.auth.password,
  },
  invalidPassword: {
    username: environment.auth.username,
    password: "incorrect-password",
  },
} satisfies Record<string, LoginCredentials>;
