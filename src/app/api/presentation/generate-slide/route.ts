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
      
      // Validar se o resultado contém uma tag SECTION
      if (!result.includes("<SECTION") || !result.includes("</SECTION>")) {
        // Se não tiver, criar um XML básico válido
        const fallbackXml = `
<SECTION layout="right">
  <H1>${topic}</H1>
  <P>Conteúdo regenerado para o tópico: ${topic}</P>
  <IMG query="abstract concept visualization related to ${topic}" />
</SECTION>`;
        
        return new Response(fallbackXml);
      }
      
      // Garantir que o XML tenha uma tag SECTION de fechamento
      let finalXml = result;
      if (!finalXml.includes("</SECTION>")) {
        finalXml += "</SECTION>";
      }
      
      return new Response(finalXml);
    } catch (error) {
      console.error("Error generating slide content:", error);
      
      // Em caso de erro, retornar um XML básico válido
      const fallbackXml = `
<SECTION layout="right">
  <H1>${topic}</H1>
  <P>Conteúdo regenerado para o tópico: ${topic}</P>
  <IMG query="abstract concept visualization related to ${topic}" />
</SECTION>`;
      
      return new Response(fallbackXml);
    }
  } catch (error) {
    console.error("Error in slide regeneration:", error);
    return NextResponse.json(
      { error: "Failed to regenerate slide" },
      { status: 500 },
    );
  }
}
