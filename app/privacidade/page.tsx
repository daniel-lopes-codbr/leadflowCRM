import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Workflow } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Política de Privacidade · LeadFlow CRM",
};

const LAST_UPDATED = "26 de agosto de 2026";

export default function PrivacidadePage() {
  return (
    <>
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Workflow className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">LeadFlow</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Alert className="mb-10">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rascunho pendente de revisão jurídica</AlertTitle>
          <AlertDescription>
            Este documento foi redigido como ponto de partida e ainda não passou por revisão de um
            advogado especializado em direito digital/LGPD. Não deve ser considerado texto final até
            essa revisão ser concluída.
          </AlertDescription>
        </Alert>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Quem somos</h2>
            <p className="mt-3">
              Esta Política de Privacidade descreve como [RAZÃO SOCIAL A PREENCHER], inscrita no CNPJ
              sob o nº [CNPJ A PREENCHER] (&quot;LeadFlow&quot;, &quot;nós&quot;), trata dados pessoais
              no âmbito da plataforma LeadFlow CRM, em conformidade com a Lei Geral de Proteção de
              Dados Pessoais (Lei nº 13.709/2018 — LGPD).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              2. Dois papéis diferentes: controlador e operador
            </h2>
            <p className="mt-3">
              É importante distinguir dois tipos de dados pessoais tratados pela plataforma:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <strong>Dados da sua conta</strong> (nome, e-mail, senha, dados de cobrança): aqui o
                LeadFlow atua como <strong>controlador</strong>, definindo a finalidade e os meios de
                tratamento.
              </li>
              <li>
                <strong>Dados que você insere sobre os seus próprios leads e clientes</strong> (nome,
                e-mail, telefone, empresa, histórico de interações): aqui você (ou sua empresa) é o{" "}
                <strong>controlador</strong>, e o LeadFlow atua apenas como{" "}
                <strong>operador</strong>, processando esses dados exclusivamente para viabilizar o
                funcionamento da plataforma que você contratou, seguindo suas instruções.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Dados que coletamos</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li><strong>Cadastro:</strong> nome, e-mail e senha (armazenada de forma criptografada, nunca em texto puro), fornecidos no momento da criação da conta.</li>
              <li><strong>Dados do workspace:</strong> nome da empresa/workspace, logotipo (opcional).</li>
              <li><strong>Dados inseridos por você sobre seus leads:</strong> nome, e-mail, telefone, empresa, cargo, histórico de atividades e, quando aplicável, documentos anexados.</li>
              <li><strong>Dados de pagamento:</strong> processados diretamente pelo Stripe, nosso processador de pagamentos — não armazenamos números de cartão de crédito em nossos servidores.</li>
              <li><strong>Dados de uso e técnicos:</strong> endereço IP, tipo de navegador e logs de acesso, coletados automaticamente para fins de segurança e diagnóstico.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Finalidade e base legal do tratamento</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li><strong>Execução de contrato</strong> (art. 7º, V, LGPD): para viabilizar o funcionamento da plataforma que você contratou.</li>
              <li><strong>Cumprimento de obrigação legal ou regulatória</strong>: para fins fiscais e de auditoria relacionados à cobrança do plano pago.</li>
              <li><strong>Legítimo interesse</strong> (art. 7º, IX, LGPD): para prevenção a fraudes, segurança da plataforma e melhoria do serviço.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Com quem compartilhamos dados</h2>
            <p className="mt-3">
              Utilizamos os seguintes prestadores de serviço (operadores) para viabilizar a plataforma,
              cada um processando dados apenas na medida necessária à sua função:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li><strong>Supabase</strong> — banco de dados, autenticação e armazenamento de arquivos.</li>
              <li><strong>Stripe</strong> — processamento de pagamentos do plano Pro.</li>
              <li><strong>Resend</strong> — envio de e-mails transacionais (confirmação de cadastro, convites de workspace).</li>
              <li><strong>Vercel</strong> — hospedagem da aplicação.</li>
            </ul>
            <p className="mt-3">
              Não vendemos nem compartilhamos dados pessoais com terceiros para fins de publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Seus direitos como titular de dados</h2>
            <p className="mt-3">Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer momento:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Confirmação da existência de tratamento e acesso aos seus dados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Exclusão de dados pessoais tratados com consentimento;</li>
              <li>Portabilidade dos dados a outro fornecedor de serviço;</li>
              <li>Informação sobre com quem seus dados são compartilhados.</li>
            </ul>
            <p className="mt-3">
              Para dados de conta e de workspace, exportação (CSV/JSON) e exclusão total estão
              disponíveis diretamente na plataforma, em Configurações → Dados. Solicitações adicionais
              podem ser enviadas para [E-MAIL DE CONTATO/DPO A PREENCHER].
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Retenção e exclusão de dados</h2>
            <p className="mt-3">
              Mantemos seus dados enquanto sua conta estiver ativa ou pelo tempo necessário para
              cumprir obrigações legais (por exemplo, fiscais). Ao excluir um workspace, todos os dados
              associados (leads, negócios, atividades, documentos) são removidos permanentemente. Em
              caso de descontinuação da plataforma, seguimos o processo descrito nos nossos{" "}
              <Link href="/termos" className="underline underline-offset-2 hover:text-primary">
                Termos de Uso
              </Link>
              , incluindo aviso prévio e oportunidade de exportação antes da exclusão definitiva.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Segurança</h2>
            <p className="mt-3">
              Adotamos medidas técnicas para proteger seus dados, incluindo isolamento de dados por
              workspace no nível do banco de dados (Row Level Security), criptografia em trânsito
              (HTTPS/TLS) e controle de acesso baseado em papéis. Nenhum sistema é 100% imune a
              incidentes; em caso de violação de dados que possa acarretar risco relevante, notificaremos
              os afetados e a Autoridade Nacional de Proteção de Dados (ANPD) conforme exigido em lei.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Cookies</h2>
            <p className="mt-3">
              Utilizamos cookies essenciais para manter sua sessão autenticada. Não utilizamos cookies
              de rastreamento publicitário de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Crianças e adolescentes</h2>
            <p className="mt-3">
              O LeadFlow é destinado a uso empresarial por maiores de 18 anos e não é direcionado a
              crianças ou adolescentes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Alterações desta política</h2>
            <p className="mt-3">
              Podemos atualizar esta Política de Privacidade periodicamente. Alterações materiais serão
              comunicadas por e-mail ou aviso na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Contato e encarregado de dados</h2>
            <p className="mt-3">
              Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com
              nosso encarregado de proteção de dados (DPO) em [E-MAIL DE CONTATO/DPO A PREENCHER].
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
