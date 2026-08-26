import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Workflow } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "Termos de Uso · LeadFlow CRM",
};

const LAST_UPDATED = "26 de agosto de 2026";

export default function TermosPage() {
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

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-10 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Aceitação dos termos</h2>
            <p className="mt-3">
              Estes Termos de Uso regem o acesso e uso da plataforma LeadFlow CRM (&quot;LeadFlow&quot;,
              &quot;nós&quot; ou &quot;plataforma&quot;), operada por [RAZÃO SOCIAL A PREENCHER], inscrita
              no CNPJ sob o nº [CNPJ A PREENCHER], com sede em [ENDEREÇO A PREENCHER]. Ao criar uma
              conta ou utilizar a plataforma, você concorda integralmente com estes termos. Caso não
              concorde, não utilize o serviço.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Descrição do serviço</h2>
            <p className="mt-3">
              O LeadFlow é um software como serviço (SaaS) de gestão de relacionamento com clientes
              (CRM), voltado a pequenas e médias empresas, freelancers e times de vendas, oferecendo
              funcionalidades como pipeline de vendas (Kanban), cadastro e histórico de leads,
              relatórios e integração de pagamento para planos pagos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Cadastro e conta</h2>
            <p className="mt-3">
              Você é responsável por manter a confidencialidade das credenciais de acesso à sua conta
              e por todas as atividades realizadas sob ela. Informações de cadastro devem ser
              verdadeiras, completas e mantidas atualizadas. Cada workspace criado na plataforma
              pertence à organização ou pessoa que o criou, e o acesso de membros adicionais é
              gerenciado pelo administrador do workspace.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Planos, cobrança e cancelamento</h2>
            <p className="mt-3">
              O LeadFlow oferece um plano gratuito (Free), com limites de uso descritos na própria
              plataforma, e um plano pago (Pro), cobrado de forma recorrente através do processador de
              pagamentos Stripe. Os valores e limites vigentes são sempre os exibidos na página de
              planos da plataforma no momento da contratação. Você pode cancelar a assinatura do plano
              Pro a qualquer momento; o cancelamento gera o rebaixamento do workspace ao plano Free ao
              final do período já pago, sem reembolso proporcional, salvo disposição legal em
              contrário.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Uso aceitável</h2>
            <p className="mt-3">Ao usar o LeadFlow, você concorda em não:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Utilizar a plataforma para armazenar ou transmitir conteúdo ilegal, fraudulento, difamatório ou que viole direitos de terceiros;</li>
              <li>Tentar acessar, sem autorização, dados de outros workspaces ou contornar mecanismos de segurança da plataforma;</li>
              <li>Utilizar a plataforma para envio de mensagens não solicitadas (spam) a terceiros;</li>
              <li>Realizar engenharia reversa, copiar ou revender a plataforma sem autorização expressa;</li>
              <li>Criar múltiplas contas gratuitas com o objetivo de contornar os limites do plano Free.</li>
            </ul>
            <p className="mt-3">
              O descumprimento destas regras pode resultar em suspensão ou encerramento da conta, a
              critério razoável do LeadFlow.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Titularidade dos dados</h2>
            <p className="mt-3">
              Os dados inseridos por você na plataforma (leads, negócios, atividades, documentos
              anexados) pertencem a você ou à sua organização. O LeadFlow atua como operador desses
              dados, processando-os apenas para viabilizar o funcionamento do serviço, nos termos da
              nossa{" "}
              <Link href="/privacidade" className="underline underline-offset-2 hover:text-primary">
                Política de Privacidade
              </Link>
              . Você é responsável por garantir que possui base legal adequada para inserir dados de
              terceiros (seus próprios leads e clientes) na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">
              7. Modificação, suspensão e descontinuação do serviço
            </h2>
            <p className="mt-3">
              Reservamo-nos o direito de modificar, suspender ou descontinuar, total ou parcialmente, o
              LeadFlow a qualquer momento, incluindo por inviabilidade comercial de continuar operando
              o serviço. Em caso de descontinuação definitiva da plataforma:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Notificaremos todos os usuários cadastrados, por e-mail, com antecedência mínima de 30 (trinta) dias da data de encerramento;</li>
              <li>Durante esse período, você poderá exportar integralmente os dados do seu workspace através da funcionalidade de exportação já disponível na plataforma (Configurações → Dados);</li>
              <li>Após a data de encerramento, os dados armazenados serão excluídos de forma definitiva, em conformidade com a Lei Geral de Proteção de Dados (LGPD).</li>
            </ul>
            <p className="mt-3">
              Esta cláusula aplica-se tanto a usuários do plano gratuito quanto pagantes; usuários do
              plano Pro com assinatura ativa no momento do encerramento não serão cobrados por período
              não utilizado.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Limitação de responsabilidade</h2>
            <p className="mt-3">
              O LeadFlow é fornecido &quot;como está&quot;, sem garantias de disponibilidade
              ininterrupta. Na máxima extensão permitida pela lei aplicável, não nos responsabilizamos
              por perdas indiretas, lucros cessantes ou danos decorrentes do uso ou impossibilidade de
              uso da plataforma, incluindo eventuais perdas de dados causadas por falhas de terceiros
              (provedores de infraestrutura, pagamento ou e-mail) fora do nosso controle razoável.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">9. Propriedade intelectual</h2>
            <p className="mt-3">
              A marca LeadFlow, o design da plataforma e o código-fonte são de propriedade exclusiva de
              [RAZÃO SOCIAL A PREENCHER] ou de seus licenciantes, não sendo concedida a você nenhuma
              licença além do direito de uso da plataforma nos termos aqui descritos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">10. Alterações destes termos</h2>
            <p className="mt-3">
              Podemos atualizar estes Termos de Uso periodicamente. Alterações materiais serão
              comunicadas por e-mail ou aviso na plataforma com antecedência razoável. O uso continuado
              do LeadFlow após uma alteração constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">11. Legislação aplicável e foro</h2>
            <p className="mt-3">
              Estes termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro
              da comarca de [CIDADE/COMARCA A PREENCHER] para dirimir quaisquer controvérsias, com
              renúncia a qualquer outro, por mais privilegiado que seja.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">12. Contato</h2>
            <p className="mt-3">
              Dúvidas sobre estes termos podem ser enviadas para [E-MAIL DE CONTATO A PREENCHER].
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
