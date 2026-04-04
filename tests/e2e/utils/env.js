const envProcess = globalThis.process;

function requiredEnv(name) {
  const value = envProcess.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required E2E environment variable: ${name}`);
  }

  return value;
}

export const credentials = {
  user: {
    email: requiredEnv("E2E_USER_EMAIL"),
    password: requiredEnv("E2E_AUTH_PASSWORD"),
  },
  admin: {
    email: requiredEnv("E2E_ADMIN_EMAIL"),
    password: requiredEnv("E2E_AUTH_PASSWORD"),
  },
  superadmin: {
    email: requiredEnv("E2E_SUPERADMIN_EMAIL"),
    password: requiredEnv("E2E_AUTH_PASSWORD"),
  },
};
