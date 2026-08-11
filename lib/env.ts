import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value.replace(/\/+$/, "") : undefined))
  .refine((value) => !value || /^https?:\/\//.test(value), {
    message: "Expected a valid URL",
  });

const serverEnvSchema = z.object({
  DECODO_API_KEY: z.string().trim().min(1, "DECODO_API_KEY is required"),
  INSFORGE_API_KEY: z.string().trim().min(1, "INSFORGE_API_KEY is required"),
  INSFORGE_URL: optionalUrl,
  INSFORGE_MODEL: z.string().trim().optional(),
  INSFORGE_RESULTS_TABLE: z.string().trim().optional(),
  DECODO_PROXY_POOL: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "standard" || val === "premium" ? val : "premium")),
  DECODO_HEADLESS_MODE: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val === "html" || val === "png" ? val : "html")),
  DECODO_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  INSFORGE_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
});

export type ServerEnv = {
  decodoApiKey: string;
  decodoProxyPool: "standard" | "premium";
  decodoHeadlessMode: "html" | "png";
  decodoTimeoutMs: number;
  insforgeApiKey: string;
  insforgeUrl: string;
  insforgeModel: string;
  insforgeTimeoutMs: number;
  insforgeResultsTable?: string;
};

let cachedEnv: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = serverEnvSchema.parse({
    DECODO_API_KEY: process.env.DECODO_API_KEY,
    INSFORGE_API_KEY: process.env.INSFORGE_API_KEY,
    INSFORGE_URL: process.env.INSFORGE_URL,
    INSFORGE_MODEL: process.env.INSFORGE_MODEL,
    INSFORGE_RESULTS_TABLE: process.env.INSFORGE_RESULTS_TABLE,
    DECODO_PROXY_POOL: process.env.DECODO_PROXY_POOL,
    DECODO_HEADLESS_MODE: process.env.DECODO_HEADLESS_MODE,
    DECODO_TIMEOUT_MS: process.env.DECODO_TIMEOUT_MS,
    INSFORGE_TIMEOUT_MS: process.env.INSFORGE_TIMEOUT_MS,
  });

  cachedEnv = {
    decodoApiKey: parsedEnv.DECODO_API_KEY,
    decodoProxyPool: parsedEnv.DECODO_PROXY_POOL,
    decodoHeadlessMode: parsedEnv.DECODO_HEADLESS_MODE,
    decodoTimeoutMs: parsedEnv.DECODO_TIMEOUT_MS ?? 20000,
    insforgeApiKey: parsedEnv.INSFORGE_API_KEY,
    insforgeUrl: parsedEnv.INSFORGE_URL ?? "https://c3ite2jk.us-east.insforge.app",
    insforgeModel: parsedEnv.INSFORGE_MODEL ?? "openai/gpt-4o-mini",
    insforgeTimeoutMs: parsedEnv.INSFORGE_TIMEOUT_MS ?? 90000,
    insforgeResultsTable: parsedEnv.INSFORGE_RESULTS_TABLE || undefined,
  };

  return cachedEnv;
}