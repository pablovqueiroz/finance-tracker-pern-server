import "dotenv/config";

const required = ["DATABASE_URL", "TOKEN_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]?.trim()) {
    throw new Error(`Missing env: ${key}`);
  }
}

export const nodeEnv = process.env.NODE_ENV ?? "development";

export const getAllowedOrigins = (): string[] => {
  const configuredOrigins = (process.env.ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return nodeEnv === "production" ? [] : ["http://localhost:5173"];
};
