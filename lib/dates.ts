// Fronteira de dia em UTC, sem conversão de timezone — mesmo precedente de
// `startOfCurrentMonthIso()` em `lib/plans.ts`. O projeto assume um único
// fuso implícito (Brasil) em vez de importar uma lib de timezone.
export function startOfUtcDayIso(daysFromToday = 0): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysFromToday)
  ).toISOString();
}
