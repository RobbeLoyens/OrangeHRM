import type { LoginCredentials } from "../pages/LoginPage";

export const users = {
  admin: {
    username: process.env.ORANGEHRM_USERNAME ?? "Admin",
    password: process.env.ORANGEHRM_PASSWORD ?? "admin123",
  },
  invalidPassword: {
    username: process.env.ORANGEHRM_USERNAME ?? "Admin",
    password: "incorrect-password",
  },
} satisfies Record<string, LoginCredentials>;
