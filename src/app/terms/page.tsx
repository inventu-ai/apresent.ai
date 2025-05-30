import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
              Termos de Serviço
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          
          <CardContent className="prose prose-slate dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar nossa plataforma de criação de apresentações com IA, você concorda 
                em cumprir e estar vinculado a estes Termos de Serviço. Se você não concordar com 
                qualquer parte destes termos, não deve usar nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
              <p>
                Nossa plataforma oferece ferramentas baseadas em inteligência artificial para criar 
                apresentações profissionais, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Geração automática de conteúdo para slides</li>
                <li>Criação de imagens com IA</li>
                <li>Templates e temas personalizáveis</li>
                <li>Editor de apresentações interativo</li>
                <li>Armazenamento seguro na nuvem</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Conta de Usuário</h2>
              <p>
                Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas 
                e atualizadas. Você é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Manter a confidencialidade de sua senha</li>
                <li>Todas as atividades que ocorrem em sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Uso Aceitável</h2>
              <p>Você concorda em não usar nosso serviço para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criar conteúdo ilegal, prejudicial ou ofensivo</li>
                <li>Violar direitos de propriedade intelectual de terceiros</li>
                <li>Transmitir spam, malware ou código malicioso</li>
                <li>Interferir no funcionamento do serviço</li>
                <li>Tentar acessar contas de outros usuários</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Propriedade Intelectual</h2>
              <p>
                Você mantém os direitos sobre o conteúdo que cria usando nossa plataforma. 
                No entanto, ao usar nosso serviço, você nos concede uma licença limitada para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Armazenar e processar seu conteúdo</li>
                <li>Fornecer os serviços solicitados</li>
                <li>Melhorar nossos algoritmos de IA (de forma anonimizada)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Privacidade e Dados</h2>
              <p>
                Respeitamos sua privacidade e protegemos seus dados pessoais conforme descrito 
                em nossa <Link href="/privacy" className="text-blue-600 hover:text-blue-500 underline">
                Política de Privacidade</Link>. Ao usar nosso serviço, você concorda com 
                nossa coleta e uso de informações conforme descrito nessa política.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
              <p>
                Nosso serviço é fornecido "como está" sem garantias de qualquer tipo. 
                Não seremos responsáveis por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Perda de dados ou conteúdo</li>
                <li>Interrupções do serviço</li>
                <li>Danos indiretos ou consequenciais</li>
                <li>Uso inadequado do conteúdo gerado por IA</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Modificações dos Termos</h2>
              <p>
                Reservamos o direito de modificar estes termos a qualquer momento. 
                Notificaremos sobre mudanças significativas por email ou através da plataforma. 
                O uso continuado após as modificações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Rescisão</h2>
              <p>
                Podemos suspender ou encerrar sua conta a qualquer momento por violação 
                destes termos. Você pode encerrar sua conta a qualquer momento através 
                das configurações da conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
              <p>
                Estes termos são regidos pelas leis do Brasil. Qualquer disputa será 
                resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato 
                conosco através do email: <strong>support@inventu.ai</strong>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
