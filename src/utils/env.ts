const required = ["DATABASE_URL", "TOKEN_SECRET", "GOOGLE_CLIENT_ID"] as const;

for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}
