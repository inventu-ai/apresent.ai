import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

interface SlideRegenerationRequest {
  title: string;      // Título da apresentação
  topic: string;      // Tópico específico para este slide
  slideIndex: number; // Índice do slide a ser regenerado
  language: string;   // Idioma a ser usado
  tone: string;       // Estilo para consultas de imagem (opcional)
}

const singleSlideTemplate = `
Você é um especialista em design de apresentações. Sua tarefa é criar um único slide de apresentação em formato XML.

## REQUISITOS PRINCIPAIS

1. FORMATO: Use tags <SECTION> para o slide
2. CONTEÚDO: NÃO copie o tópico literalmente - expanda com exemplos, dados e contexto
3. VISUAL: Inclua consultas de imagem detalhadas (10+ palavras) no slide

## DETALHES DO SLIDE
- Título da Apresentação: {TITLE}
- Tópico do Slide: {TOPIC}
- Idioma: {LANGUAGE}
- Tom: {TONE}
- Número do Slide: {SLIDE_INDEX}

## ESTRUTURA DO SLIDE
\`\`\`xml
<SECTION layout="left" | "right" | "vertical">
  <!-- Obrigatório: incluir UM componente de layout -->
  <!-- Obrigatório: incluir pelo menos uma consulta de imagem detalhada -->
</SECTION>
\`\`\`

## LAYOUTS DE SEÇÃO
Varie o atributo layout na tag SECTION para controlar o posicionamento da imagem:
- layout="left" - Imagem principal aparece no lado esquerdo
- layout="right" - Imagem principal aparece no lado direito
- layout="vertical" - Imagem principal aparece no topo

## LAYOUTS DISPONÍVEIS
Escolha UM layout diferente para o slide:

1. COLUMNS: Para comparações
\`\`\`xml
<COLUMNS>
  <DIV><H3>Primeiro Conceito</H3><P>Descrição</P></DIV>
  <DIV><H3>Segundo Conceito</H3><P>Descrição</P></DIV>
</COLUMNS>
\`\`\`

2. BULLETS: Para pontos-chave
\`\`\`xml
<BULLETS>
  <DIV><H3>Ponto Principal</H3><P>Descrição</P></DIV>
  <DIV><P>Segundo ponto com detalhes</P></DIV>
</BULLETS>
\`\`\`

3. ICONS: Para conceitos com símbolos
\`\`\`xml
<ICONS>
  <DIV><ICON query="rocket" /><H3>Inovação</H3><P>Descrição</P></DIV>
  <DIV><ICON query="shield" /><H3>Segurança</H3><P>Descrição</P></DIV>
</ICONS>
\`\`\`

4. CYCLE: Para processos e fluxos de trabalho
\`\`\`xml
<CYCLE>
  <DIV><H3>Pesquisa</H3><P>Fase de exploração inicial</P></DIV>
  <DIV><H3>Design</H3><P>Fase de criação da solução</P></DIV>
  <DIV><H3>Implementar</H3><P>Fase de execução</P></DIV>
  <DIV><H3>Avaliar</H3><P>Fase de avaliação</P></DIV>
</CYCLE>
\`\`\`

5. ARROWS: Para causa-efeito ou fluxos
\`\`\`xml
<ARROWS>
  <DIV><H3>Desafio</H3><P>Problema atual do mercado</P></DIV>
  <DIV><H3>Solução</H3><P>Nossa abordagem inovadora</P></DIV>
  <DIV><H3>Resultado</H3><P>Resultados mensuráveis</P></DIV>
</ARROWS>
\`\`\`

6. TIMELINE: Para progressão cronológica
\`\`\`xml
<TIMELINE>
  <DIV><H3>2022</H3><P>Pesquisa de mercado concluída</P></DIV>
  <DIV><H3>2023</H3><P>Fase de desenvolvimento do produto</P></DIV>
  <DIV><H3>2024</H3><P>Expansão do mercado global</P></DIV>
</TIMELINE>
\`\`\`

7. PYRAMID: Para importância hierárquica
\`\`\`xml
<PYRAMID>
  <DIV><H3>Visão</H3><P>Nosso objetivo aspiracional</P></DIV>
  <DIV><H3>Estratégia</H3><P>Abordagens-chave para alcançar a visão</P></DIV>
  <DIV><H3>Táticas</H3><P>Etapas específicas de implementação</P></DIV>
</PYRAMID>
\`\`\`

8. STAIRCASE: Para avanço progressivo
\`\`\`xml
<STAIRCASE>
  <DIV><H3>Básico</H3><P>Capacidades fundamentais</P></DIV>
  <DIV><H3>Avançado</H3><P>Recursos e benefícios aprimorados</P></DIV>
  <DIV><H3>Especialista</H3><P>Capacidades e resultados premium</P></DIV>
</STAIRCASE>
\`\`\`

9. CHART: Para visualização de dados
\`\`\`xml
<CHART charttype="vertical-bar">
  <TABLE>
    <TR><TD type="label"><VALUE>Q1</VALUE></TD><TD type="data"><VALUE>45</VALUE></TD></TR>
    <TR><TD type="label"><VALUE>Q2</VALUE></TD><TD type="data"><VALUE>72</VALUE></TD></TR>
    <TR><TD type="label"><VALUE>Q3</VALUE></TD><TD type="data"><VALUE>89</VALUE></TD></TR>
  </TABLE>
</CHART>
\`\`\`

10. IMAGES: A maioria dos slides precisa de pelo menos uma
\`\`\`xml
<!-- Boas consultas de imagem (detalhadas, específicas): -->
<IMG query="cidade inteligente futurista com infraestrutura de energia renovável e veículos autônomos na luz da manhã" />
<IMG query="close-up de microchip com padrões de placa de circuito em tons de azul e dourado" />
<IMG query="equipe diversificada de profissionais colaborando em escritório moderno com visualizações de dados" />

<!-- NÃO apenas: "cidade", "microchip", "reunião de equipe" -->
\`\`\`

## ESTRATÉGIA DE EXPANSÃO DE CONTEÚDO
Para o tópico do slide:
- Adicione dados/estatísticas de suporte
- Inclua exemplos do mundo real
- Faça referência a tendências do setor
- Adicione perguntas que estimulem o pensamento

## REGRAS CRÍTICAS
1. Gere EXATAMENTE um slide. NÃO MAIS, NÃO MENOS!
2. NÃO copie o tópico literalmente - expanda e aprimore
3. Inclua pelo menos uma consulta de imagem detalhada no slide
4. Use hierarquia de títulos apropriada
5. Varie o atributo de layout da SECTION (esquerda/direita/vertical)

Agora crie um slide XML completo que expanda significativamente o tópico fornecido.
`;

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  streaming: true,
});

/**
 * Função auxiliar para garantir que um valor seja uma string
 */
function ensureString(value: string | undefined | null, defaultValue: string): string {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  return value;
}

/**
 * Gera um XML de fallback com layout variado
 */
function getRandomFallbackXml(topic: string, slideIndex: number): string {
  // Função para gerar um número aleatório de itens (2 ou 3)
  const getRandomItemCount = (): number => Math.random() > 0.5 ? 2 : 3;
  
  // Gerar layouts com número variável de itens
  const layouts: string[] = [];
  
  // Layout com colunas numeradas - versão com 2 itens
  layouts.push(`<SECTION layout="left">
  <H1>${topic}</H1>
  <COLUMNS>
    <DIV>
      <H3>1</H3>
      <H3>Aspecto Principal</H3>
      <P>Detalhes importantes sobre ${topic} incluindo estatísticas e exemplos relevantes para contextualização.</P>
    </DIV>
    <DIV>
      <H3>2</H3>
      <H3>Impacto e Relevância</H3>
      <P>Como ${topic} influencia o cenário atual e sua importância para o desenvolvimento futuro.</P>
    </DIV>
  </COLUMNS>
  <IMG query="professional visualization of ${topic} concept with detailed infographics in modern style" />
</SECTION>`);

  // Layout com colunas numeradas - versão com 3 itens
  layouts.push(`<SECTION layout="left">
  <H1>${topic}</H1>
  <COLUMNS>
    <DIV>
      <H3>1</H3>
      <H3>Conceito Básico</H3>
      <P>Fundamentos e princípios essenciais de ${topic} para compreensão inicial.</P>
    </DIV>
    <DIV>
      <H3>2</H3>
      <H3>Aplicações</H3>
      <P>Como ${topic} é aplicado em diferentes contextos e situações práticas.</P>
    </DIV>
    <DIV>
      <H3>3</H3>
      <H3>Tendências Futuras</H3>
      <P>Direções emergentes e desenvolvimentos esperados para ${topic}.</P>
    </DIV>
  </COLUMNS>
  <IMG query="professional visualization of ${topic} concept with detailed infographics in modern style" />
</SECTION>`);

  // Layout com bullets - versão com 2 itens
  layouts.push(`<SECTION layout="right">
  <H1>${topic}</H1>
  <BULLETS>
    <DIV><H3>Ponto Chave 1</H3><P>Análise detalhada do primeiro aspecto de ${topic} com exemplos práticos.</P></DIV>
    <DIV><H3>Ponto Chave 2</H3><P>Exploração do segundo aspecto relevante com dados estatísticos de suporte.</P></DIV>
  </BULLETS>
  <IMG query="detailed illustration of ${topic} with professional design elements and data visualization" />
</SECTION>`);

  // Layout com bullets - versão com 3 itens
  layouts.push(`<SECTION layout="right">
  <H1>${topic}</H1>
  <BULLETS>
    <DIV><H3>Ponto Chave 1</H3><P>Análise detalhada do primeiro aspecto de ${topic} com exemplos práticos.</P></DIV>
    <DIV><H3>Ponto Chave 2</H3><P>Exploração do segundo aspecto relevante com dados estatísticos de suporte.</P></DIV>
    <DIV><H3>Ponto Chave 3</H3><P>Considerações importantes sobre o impacto e as tendências futuras.</P></DIV>
  </BULLETS>
  <IMG query="detailed illustration of ${topic} with professional design elements and data visualization" />
</SECTION>`);

  // Layout com ícones - versão com 2 itens
  layouts.push(`<SECTION layout="vertical">
  <H1>${topic}</H1>
  <ICONS>
    <DIV><ICON query="lightbulb" /><H3>Inovação</H3><P>Como ${topic} está transformando o cenário atual com abordagens inovadoras.</P></DIV>
    <DIV><ICON query="chart-line" /><H3>Crescimento</H3><P>Tendências de crescimento e desenvolvimento relacionadas a ${topic}.</P></DIV>
  </ICONS>
  <IMG query="conceptual image of ${topic} with modern design elements and professional aesthetic" />
</SECTION>`);

  // Layout com ícones - versão com 3 itens
  layouts.push(`<SECTION layout="vertical">
  <H1>${topic}</H1>
  <ICONS>
    <DIV><ICON query="lightbulb" /><H3>Inovação</H3><P>Como ${topic} está transformando o cenário atual com abordagens inovadoras.</P></DIV>
    <DIV><ICON query="chart-line" /><H3>Crescimento</H3><P>Tendências de crescimento e desenvolvimento relacionadas a ${topic}.</P></DIV>
    <DIV><ICON query="users" /><H3>Impacto Social</H3><P>O efeito de ${topic} na sociedade e nas comunidades.</P></DIV>
  </ICONS>
  <IMG query="conceptual image of ${topic} with modern design elements and professional aesthetic" />
</SECTION>`);

  // Layout com ciclo - versão com 3 itens
  layouts.push(`<SECTION layout="right">
  <H1>${topic}</H1>
  <CYCLE>
    <DIV><H3>Fase 1</H3><P>Início do processo relacionado a ${topic} com detalhes importantes.</P></DIV>
    <DIV><H3>Fase 2</H3><P>Desenvolvimento e evolução dos conceitos principais.</P></DIV>
    <DIV><H3>Fase 3</H3><P>Implementação e avaliação final dos resultados.</P></DIV>
  </CYCLE>
  <IMG query="cyclical process diagram illustrating ${topic} with professional design elements" />
</SECTION>`);

  // Layout com ciclo - versão com 4 itens
  layouts.push(`<SECTION layout="right">
  <H1>${topic}</H1>
  <CYCLE>
    <DIV><H3>Fase 1</H3><P>Início do processo relacionado a ${topic} com detalhes importantes.</P></DIV>
    <DIV><H3>Fase 2</H3><P>Desenvolvimento e evolução dos conceitos principais.</P></DIV>
    <DIV><H3>Fase 3</H3><P>Implementação e aplicação prática no contexto atual.</P></DIV>
    <DIV><H3>Fase 4</H3><P>Avaliação de resultados e planejamento futuro.</P></DIV>
  </CYCLE>
  <IMG query="cyclical process diagram illustrating ${topic} with professional design elements" />
</SECTION>`);

  // Layout com timeline - versão com 2 itens
  layouts.push(`<SECTION layout="left">
  <H1>${topic}</H1>
  <TIMELINE>
    <DIV><H3>Passado</H3><P>Origens e desenvolvimento histórico de ${topic} com marcos importantes.</P></DIV>
    <DIV><H3>Futuro</H3><P>Tendências emergentes e potencial de evolução nos próximos anos.</P></DIV>
  </TIMELINE>
  <IMG query="timeline visualization of the evolution of ${topic} with detailed infographics" />
</SECTION>`);

  // Layout com timeline - versão com 3 itens
  layouts.push(`<SECTION layout="left">
  <H1>${topic}</H1>
  <TIMELINE>
    <DIV><H3>Passado</H3><P>Origens e desenvolvimento histórico de ${topic} com marcos importantes.</P></DIV>
    <DIV><H3>Presente</H3><P>Estado atual e aplicações contemporâneas em diversos contextos.</P></DIV>
    <DIV><H3>Futuro</H3><P>Tendências emergentes e potencial de evolução nos próximos anos.</P></DIV>
  </TIMELINE>
  <IMG query="timeline visualization of the evolution of ${topic} with detailed infographics" />
</SECTION>`);

  // Escolher um layout aleatório
  const randomIndex = Math.floor(Math.random() * layouts.length);
  return layouts[randomIndex];
}

/**
 * Adiciona um layout complexo a um XML existente
 */
function addComplexLayoutToXml(xml: string, topic: string): string {
  // Verificar se o XML já tem um layout complexo
  if (
    xml.includes("<COLUMNS") ||
    xml.includes("<BULLETS") ||
    xml.includes("<ICONS") ||
    xml.includes("<CYCLE") ||
    xml.includes("<ARROWS") ||
    xml.includes("<TIMELINE") ||
    xml.includes("<PYRAMID") ||
    xml.includes("<STAIRCASE") ||
    xml.includes("<CHART")
  ) {
    return xml; // Já tem layout complexo, retornar sem modificar
  }

  // Extrair o título do slide, se existir
  const titleMatch = xml.match(/<H1>(.*?)<\/H1>/i);
  const title = ensureString(titleMatch?.[1], topic);

  // Extrair o conteúdo de texto, se existir
  const contentMatch = xml.match(/<P>(.*?)<\/P>/i);
  const content = ensureString(contentMatch?.[1], `Conteúdo sobre ${topic}`);

  // Extrair a consulta de imagem, se existir
  const imgMatch = xml.match(/query="([^"]*)"/i);
  const imgQuery = ensureString(imgMatch?.[1], `detailed visualization of ${topic}`);

  // Extrair o atributo de layout, se existir
  const layoutMatch = xml.match(/layout="([^"]*)"/i);
  const layout = ensureString(layoutMatch?.[1], "right");

  // Função para decidir aleatoriamente entre 2 ou 3 itens
  const useThreeItems = Math.random() > 0.5;
  
  // Array de layouts complexos possíveis
  const complexLayouts: string[] = [];
  
  // Layout com colunas - versão com 2 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <COLUMNS>
    <DIV>
      <H3>Aspectos Principais</H3>
      <P>${content}</P>
    </DIV>
    <DIV>
      <H3>Impacto e Relevância</H3>
      <P>Análise do impacto e da importância de ${topic} no contexto atual.</P>
    </DIV>
  </COLUMNS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com colunas - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <COLUMNS>
    <DIV>
      <H3>Conceito</H3>
      <P>${content}</P>
    </DIV>
    <DIV>
      <H3>Aplicações</H3>
      <P>Como ${topic} é aplicado em diferentes contextos e situações.</P>
    </DIV>
    <DIV>
      <H3>Tendências</H3>
      <P>Desenvolvimentos futuros e direções emergentes para ${topic}.</P>
    </DIV>
  </COLUMNS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com bullets - versão com 2 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <BULLETS>
    <DIV><H3>Ponto Chave</H3><P>${content}</P></DIV>
    <DIV><H3>Considerações</H3><P>Aspectos importantes a serem considerados sobre ${topic}.</P></DIV>
  </BULLETS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com bullets - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <BULLETS>
    <DIV><H3>Ponto Chave</H3><P>${content}</P></DIV>
    <DIV><H3>Considerações</H3><P>Aspectos importantes a serem considerados sobre ${topic}.</P></DIV>
    <DIV><H3>Aplicações</H3><P>Como ${topic} pode ser aplicado em diferentes contextos.</P></DIV>
  </BULLETS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com ícones - versão com 2 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <ICONS>
    <DIV><ICON query="lightbulb" /><H3>Conceito</H3><P>${content}</P></DIV>
    <DIV><ICON query="chart-line" /><H3>Tendências</H3><P>Direções futuras e desenvolvimentos em ${topic}.</P></DIV>
  </ICONS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com ícones - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <ICONS>
    <DIV><ICON query="lightbulb" /><H3>Conceito</H3><P>${content}</P></DIV>
    <DIV><ICON query="chart-line" /><H3>Tendências</H3><P>Direções futuras e desenvolvimentos em ${topic}.</P></DIV>
    <DIV><ICON query="users" /><H3>Impacto</H3><P>Como ${topic} afeta diferentes áreas e contextos.</P></DIV>
  </ICONS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Escolher um layout complexo aleatório
  const randomIndex = Math.floor(Math.random() * complexLayouts.length);
  return complexLayouts[randomIndex];
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, topic, slideIndex, language, tone } =
      (await req.json()) as SlideRegenerationRequest;

    if (!title || !topic || slideIndex === undefined || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompt = PromptTemplate.fromTemplate(singleSlideTemplate);
    const stringOutputParser = new StringOutputParser();
    const chain = RunnableSequence.from([prompt, model, stringOutputParser]);

    // Usar invoke em vez de stream para poder validar o resultado antes de retornar
    try {
      const result = await chain.invoke({
        TITLE: title,
        TOPIC: topic,
        SLIDE_INDEX: slideIndex + 1, // Converter para número baseado em 1 para o prompt
        LANGUAGE: language,
        TONE: tone || "professional",
      });
      
      console.log("XML gerado pelo modelo:", result);
      
      // Verificar se o resultado contém tags de layout complexo
      const hasComplexLayout = 
        result.includes("<COLUMNS") || 
        result.includes("<BULLETS") || 
        result.includes("<ICONS") || 
        result.includes("<CYCLE") || 
        result.includes("<ARROWS") || 
        result.includes("<TIMELINE") || 
        result.includes("<PYRAMID") || 
        result.includes("<STAIRCASE") || 
        result.includes("<CHART");
      
      console.log("O XML contém layout complexo?", hasComplexLayout);
      
      // Validação mais relaxada - apenas verificar se há alguma tag SECTION
      if (!result.includes("<SECTION")) {
        console.log("XML sem tag SECTION, usando fallback variado");
        // Escolher um fallback aleatório com layout mais complexo
        return new Response(getRandomFallbackXml(topic, slideIndex));
      }
      
      // Garantir que o XML tenha uma tag SECTION de fechamento
      let finalXml = result;
      if (!finalXml.includes("</SECTION>")) {
        finalXml += "</SECTION>";
      }
      
      // Se não tiver layout complexo, tentar adicionar um
      if (!hasComplexLayout && Math.random() > 0.3) { // 70% de chance de adicionar layout complexo
        console.log("XML sem layout complexo, adicionando layout complexo");
        finalXml = addComplexLayoutToXml(finalXml, topic);
      }
      
      return new Response(finalXml);
    } catch (error) {
      console.error("Error generating slide content:", error);
      
      // Em caso de erro, retornar um XML com layout variado
      console.log("Erro ao gerar slide, usando fallback variado");
      return new Response(getRandomFallbackXml(topic, slideIndex));
    }
  } catch (error) {
    console.error("Error in slide regeneration:", error);
    return NextResponse.json(
      { error: "Failed to regenerate slide" },
      { status: 500 },
    );
  }
}
