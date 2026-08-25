import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Nomes de env var vêm do produto "Upstash for Redis" (compat com o antigo
// @vercel/kv) provisionado via Vercel Marketplace — não é o padrão
// UPSTASH_REDIS_REST_URL/TOKEN que Redis.fromEnv() espera por padrão.
function createRedisClient() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    throw new Error("KV_REST_API_URL/KV_REST_API_TOKEN não configuradas.");
  }
  return new Redis({ url, token });
}

// Freio contra abuso vindo de fora (brute force de token, spam de convite,
// tentativa de login em massa) — não substitui RLS/RBAC, que já protegem
// contra usuário autenticado malicioso.
export function createRatelimiter(prefix: string, limit: number, window: `${number} s`) {
  return new Ratelimit({
    redis: createRedisClient(),
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `ratelimit:${prefix}`,
    analytics: false,
  });
}

// Vercel injeta o IP real do cliente em x-forwarded-for (pode vir com mais
// de um IP separado por vírgula quando há proxies encadeados — o primeiro é
// o do cliente). Sem fallback "fixo": preferimos deixar a chave vazia (o
// limitador aí passa a valer por identificador único global) a fingir que
// sabemos o IP quando não sabemos.
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
