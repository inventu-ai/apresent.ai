import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/auth/signin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Button>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Política de Privacidade
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
              <p>
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e 
                protegemos suas informações pessoais quando você usa nossa plataforma de 
                criação de apresentações com IA. Respeitamos sua privacidade e estamos 
                comprometidos em proteger seus dados pessoais.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
              
              <h3 className="text-xl font-semibold mb-3">2.1 Informações Fornecidas por Você</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de Conta:</strong> Nome, email, senha (criptografada)</li>
                <li><strong>Conteúdo:</strong> Apresentações, textos, imagens que você cria</li>
                <li><strong>Preferências:</strong> Configurações de tema, idioma, notificações</li>
                <li><strong>Comunicações:</strong> Mensagens de suporte, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Informações Coletadas Automaticamente</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de Uso:</strong> Como você interage com nossa plataforma</li>
                <li><strong>Informações Técnicas:</strong> Endereço IP, tipo de navegador, dispositivo</li>
                <li><strong>Cookies:</strong> Para melhorar sua experiência e manter você logado</li>
                <li><strong>Logs:</strong> Registros de atividade para segurança e melhoria do serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Como Usamos suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Fornecer o Serviço:</strong> Criar, salvar e gerenciar suas apresentações</li>
                <li><strong>Autenticação:</strong> Verificar sua identidade e manter sua conta segura</li>
                <li><strong>Melhorar a IA:</strong> Treinar nossos modelos (de forma anonimizada)</li>
                <li><strong>Suporte:</strong> Responder suas dúvidas e resolver problemas</li>
                <li><strong>Comunicação:</strong> Enviar atualizações importantes sobre o serviço</li>
                <li><strong>Segurança:</strong> Detectar e prevenir atividades fraudulentas</li>
                <li><strong>Análise:</strong> Entender como melhorar nossa plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
              <p>
                <strong>Não vendemos seus dados pessoais.</strong> Podemos compartilhar informações 
                limitadas apenas nas seguintes situações:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provedores de Serviço:</strong> Empresas que nos ajudam a operar a plataforma (ex: hospedagem, email)</li>
                <li><strong>Requisitos Legais:</strong> Quando exigido por lei ou ordem judicial</li>
                <li><strong>Proteção de Direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
                <li><strong>Consentimento:</strong> Quando você autorizar expressamente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Armazenamento e Segurança</h2>
              
              <h3 className="text-xl font-semibold mb-3">5.1 Onde Armazenamos</h3>
              <p>
                Seus dados são armazenados em servidores seguros na nuvem (Supabase) com 
                criptografia em trânsito e em repouso. Utilizamos datacenters certificados 
                com medidas de segurança física e digital.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Medidas de Segurança</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criptografia SSL/TLS para todas as comunicações</li>
                <li>Senhas criptografadas com hash seguro</li>
                <li>Autenticação de dois fatores disponível</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e seguros</li>
                <li>Controle de acesso baseado em funções</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos</h2>
              <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você</li>
                <li><strong>Correção:</strong> Atualizar informações incorretas ou incompletas</li>
                <li><strong>Exclusão:</strong> Solicitar a remoção de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado</li>
                <li><strong>Restrição:</strong> Limitar como processamos seus dados</li>
                <li><strong>Objeção:</strong> Opor-se ao processamento de seus dados</li>
                <li><strong>Retirada de Consentimento:</strong> Revogar permissões anteriormente dadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies e Tecnologias Similares</h2>
              <p>Utilizamos cookies para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essenciais:</strong> Manter você logado e garantir funcionalidade básica</li>
                <li><strong>Preferências:</strong> Lembrar suas configurações e escolhas</li>
                <li><strong>Análise:</strong> Entender como você usa nossa plataforma</li>
                <li><strong>Segurança:</strong> Detectar atividades suspeitas</li>
              </ul>
              <p className="mt-4">
                Você pode gerenciar cookies através das configurações do seu navegador, 
                mas isso pode afetar algumas funcionalidades da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Retenção de Dados</h2>
              <p>Mantemos seus dados pessoais apenas pelo tempo necessário para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer nossos serviços</li>
                <li>Cumprir obrigações legais</li>
                <li>Resolver disputas</li>
                <li>Fazer cumprir nossos acordos</li>
              </ul>
              <p className="mt-4">
                Quando você excluir sua conta, removeremos seus dados pessoais dentro de 30 dias, 
                exceto quando a retenção for exigida por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Transferências Internacionais</h2>
              <p>
                Seus dados podem ser processados em países fora do Brasil. Garantimos que 
                essas transferências atendam aos padrões de proteção adequados através de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cláusulas contratuais padrão</li>
                <li>Certificações de adequação</li>
                <li>Medidas de segurança equivalentes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Menores de Idade</h2>
              <p>
                Nosso serviço não é destinado a menores de 13 anos. Não coletamos 
                intencionalmente informações pessoais de crianças menores de 13 anos. 
                Se descobrirmos que coletamos tais informações, as excluiremos imediatamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
                sobre mudanças significativas por email ou através de aviso em nossa plataforma. 
                A data da última atualização será sempre indicada no topo desta página.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Conformidade com LGPD</h2>
              <p>
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) 
                do Brasil. Processamos seus dados com base legal adequada e respeitamos todos 
                os seus direitos como titular de dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contato</h2>
              <p>
                Para exercer seus direitos, fazer perguntas sobre esta política ou relatar 
                preocupações sobre privacidade, entre em contato conosco:
              </p>
              <ul className="list-none space-y-2 mt-4">
                <li><strong>Email:</strong> support@inventu.ai</li>
                <li><strong>Email de Suporte:</strong> support@inventu.ai</li>
                <li><strong>Encarregado de Dados (DPO):</strong> support@inventu.ai</li>
              </ul>
              <p className="mt-4">
                Responderemos às suas solicitações dentro de 15 dias úteis, conforme 
                exigido pela LGPD.
              </p>
            </section>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Nota:</strong> Esta política foi elaborada para ser clara e transparente. 
                Se você tiver dúvidas sobre qualquer seção, não hesite em nos contatar. 
                Estamos comprometidos em proteger sua privacidade e manter a transparência 
                sobre como tratamos seus dados.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
