/**
 * supabase-js retorna relações to-one embutidas (`select("*, profiles(name)")`)
 * ora como objeto, ora como array de 1 item, dependendo da versão/inferência
 * de cardinalidade do PostgREST. Normaliza os dois formatos.
 */
export function toOneRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
