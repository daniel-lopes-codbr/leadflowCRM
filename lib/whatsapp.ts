// Telefone é salvo em texto livre (só valida tamanho mínimo em leads/actions.ts),
// então aceita qualquer formatação — "(11) 99999-9999", "11999999999", "+55 11
// 99999-9999" etc. Normaliza pra dígitos puros e garante o DDI 55 (Brasil) no
// início, formato exigido pelo link do WhatsApp (wa.me/<DDI><DDD><número>).
export function buildWhatsappLink(phone: string | null | undefined): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");

  // Menos que DDD (2) + número local (8) não dá pra montar um link confiável.
  if (digits.length < 10) return null;

  const withCountryCode = digits.length >= 12 ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}`;
}
