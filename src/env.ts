const requiredServerEnvVars = ["DATABASE_URL", "DIRECT_URL"] as const;
const requiredPublicEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

type ServerEnvKey = (typeof requiredServerEnvVars)[number];
type PublicEnvKey = (typeof requiredPublicEnvVars)[number];

type Env = Record<ServerEnvKey, string> & Record<PublicEnvKey, string>;

function getEnvVar(key: ServerEnvKey | PublicEnvKey): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
}

const env = {
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  DIRECT_URL: getEnvVar("DIRECT_URL"),
  NEXT_PUBLIC_SUPABASE_URL: getEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} satisfies Env;

export default env;
