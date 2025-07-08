import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { consumeSlideGenerationCredits, canExecuteAction } from "@/lib/credit-system";

interface SlideRegenerationRequest {
  title: string;      // Título da apresentação
  topic: string;      // Tópico específico para este slide
  slideIndex: number; // Índice do slide a ser regenerado
  language: string;   // Idioma a ser usado
  tone: string;       // Estilo para consultas de imagem (opcional)
  context?: string[]; // Contexto dos outros slides (opcional)
  userName: string;   // Nome do usuário (obrigatório para o slide de introdução)
  isIntroSlide?: boolean; // Flag explícita para indicar que é um slide de introdução
  forceVariability?: boolean; // Flag para forçar variabilidade na regeneração de slides
}

const introSlideTemplate = `
You are an expert presentation designer. Your task is to create the introduction slide of a presentation in XML format.

## INTRO SLIDE REQUIREMENTS

- The first slide must always be an introduction to the topic.
- It must contain a large, bold title (H1) with the main subject of the presentation.
- EXTREMELY IMPORTANT: The title must be VERY SHORT and CONCISE - MAXIMUM 6 WORDS
  - Titles must be brief, impactful, and focused
  - DO NOT use complete sentences as titles
  - DO NOT include phrases like "Aspects of" or "Introduction to" in titles
  - DO NOT use special characters like #, *, •, etc. in titles
  - NEVER start titles with "#" or include "#" anywhere in the title
  - REMOVE ALL "#" characters from titles completely
  - DO NOT start titles with "O que é", "Como funciona", etc.
  - BAD TITLE EXAMPLE: "# O Front Europeu - A luta entre os Aliados e o Eixo na Europa - Impacto da guerra na população civil e na economia"
  - GOOD TITLE EXAMPLE: "O Front Europeu"
  - GOOD TITLE EXAMPLE: "Segunda Guerra Mundial"
  - GOOD TITLE EXAMPLE: "Revolução Industrial"
  - GOOD TITLE EXAMPLE: "Inteligência Artificial"
  - GOOD TITLE EXAMPLE: "Mudanças Climáticas"
  - REMEMBER: The title should be a short phrase, not a complete sentence or paragraph
- Below the title, write a short introduction (1 or 2 paragraphs):
  - If there are two paragraphs, each must have a maximum of 3 lines (short, objective sentences).
  - If there is only one paragraph, it can have up to 7 lines.
  - Avoid excessive spacing between paragraphs; the text should be visually compact.
  - Do not use long sentences or large blocks of text.
- Add a large, relevant, and visually striking image on the side (layout="right" or "left").
- Always display the user's name (e.g., "by {USER_NAME}") below the introduction text, using ONLY the <h6> tag for maximum visual highlight.
- The user's name MUST be displayed with increased font size and bold formatting for maximum visibility.
- Example:
  <h6>by {USER_NAME}</h6>
- If the user's name is not inside <h6>, the answer is INVALID.
- Use "by" in English, "por" in Portuguese, "por" in Spanish, "par" in French, etc., according to the slide language.
- IMPORTANT: The user's name must be the most visually prominent text element after the main title.

## CRITICAL RULES FOR INTRO SLIDES
- DO NOT use any complex layouts like COLUMNS, BULLETS, ICONS, CYCLE, ARROWS, TIMELINE, PYRAMID, STAIRCASE, or CHART.
- The intro slide must ONLY contain: H1 title, P paragraph(s), h6 user name, and IMG.
- The structure must be simple and focused on introducing the topic.
- Any response that includes complex layouts for an intro slide is INVALID.

## CRITICAL XML FORMATTING RULES
1. NEVER include line breaks within text content - all text must be on a single line
2. NEVER use special characters like curly quotes, em dashes, or non-ASCII characters
3. ALWAYS use standard ASCII characters only (a-z, A-Z, 0-9, basic punctuation)
4. ALWAYS properly close all XML tags
5. NEVER nest tags incorrectly
6. ALWAYS use double quotes for attributes (query="example")
7. NEVER include XML tags or angle brackets (<>) within text content
8. ALWAYS escape special characters in text: use &lt; for <, &gt; for >, &amp; for &
9. NEVER include raw HTML or XML markup within text content
10. ALWAYS format lists as proper XML structures, not as plain text with line breaks
11. NEVER use style attributes in tags (like style="font-size: 1.5em")
12. NEVER include O" or any similar character combinations at the start of text

## SLIDE DETAILS
- Presentation Title: {TITLE}
- Slide Topic: {TOPIC}
- Language: {LANGUAGE}
- Tone: {TONE}
- Slide Number: {SLIDE_INDEX}
- Other Slides Context: {CONTEXT}
- User Name: {USER_NAME}

## INTRO SLIDE STRUCTURE
\`\`\`xml
<SECTION layout="left" | "right">
  <H1>Slide Title</H1>
  <P>Short introduction (max 3 lines per paragraph if two, or 7 lines if only one).</P>
  <P>Optional second paragraph (max 3 lines).</P>
  <h6>by {USER_NAME}</h6>
  <IMG query="detailed image description" />
</SECTION>
\`\`\`

## SECTION LAYOUTS
Vary the layout attribute in the SECTION tag to control image placement:
- layout="left" - Main image appears on the left side
- layout="right" - Main image appears on the right side
`

const singleSlideTemplate = `
You are an expert presentation designer. Your task is to create a single presentation slide in XML format.

## CORE REQUIREMENTS

1. FORMAT: Use <SECTION> tags for the slide
2. CONTENT: DO NOT copy the topic verbatim - expand with examples, data, and context
3. VARIETY: Use an appropriate layout component for the slide content
4. VISUALS: Include detailed image queries (10+ words) on the slide

## CRITICAL XML FORMATTING RULES
1. NEVER include line breaks within text content - all text must be on a single line
2. NEVER use special characters like curly quotes, em dashes, or non-ASCII characters
3. ALWAYS use standard ASCII characters only (a-z, A-Z, 0-9, basic punctuation)
4. ALWAYS properly close all XML tags
5. NEVER nest tags incorrectly
6. ALWAYS use double quotes for attributes (query="example")
7. NEVER include XML tags or angle brackets (<>) within text content
8. ALWAYS escape special characters in text: use &lt; for <, &gt; for >, &amp; for &
9. NEVER include raw HTML or XML markup within text content
10. ALWAYS format lists as proper XML structures, not as plain text with line breaks
11. NEVER use style attributes in tags (like style="margin-top:2em")
12. NEVER include O" or any similar character combinations at the start of text

## SLIDE DETAILS
- Presentation Title: {TITLE}
- Slide Topic: {TOPIC}
- Language: {LANGUAGE}
- Tone: {TONE}
- Slide Number: {SLIDE_INDEX}
- Other Slides Context: {CONTEXT}

## CONTENT DENSITY MANAGEMENT
- For slides with 1-2 topics: include images normally with layout="left" or layout="right".
- For slides with 3-4 topics with SHORT texts (1-2 lines each): use layout="vertical" (image at the top).
- For slides with 3-4 topics with MEDIUM texts (3+ lines each): do NOT include images at all.
- For slides with 5+ topics: NEVER include images regardless of text length.
- For slides with CHART components: NEVER include images - charts are the visual focus of the slide.
- For slides with CHART components: use SHORT to MEDIUM length texts only (maximum 2-3 sentences per paragraph).
- For slides with tables: if necessary, omit the image completely; if the table is small, you may include an image.
- For slides with tables: if you include an image, use "left" or "right" layout to position the image laterally.

## CONTENT BALANCING
- Prioritize readability over the number of visual elements.
- Slides with many topics (3+) should focus on textual content without additional images.
- Avoid overloading slides with too many elements (text + image + icons).

## CONTENT BALANCE REQUIREMENTS
- ALL topics in a slide MUST have similar length and detail level
- If one topic has 3-4 sentences, ALL other topics should have 3-4 sentences
- NEVER create slides where one topic has a long paragraph while others have only one sentence
- Ensure ALL topics have substantial content (minimum 2-3 full sentences each)
- Balance the information density across ALL topics in multi-topic layouts

## BALANCED CONTENT EXAMPLES
GOOD EXAMPLE (balanced):
Topic 1: [3-4 sentences with specific details about the concept]
Topic 2: [3-4 sentences with specific details about the application]
Topic 3: [3-4 sentences with specific details about the impact]

BAD EXAMPLE (unbalanced):
Topic 1: [Long paragraph with many details and examples]
Topic 2: [Single generic sentence with no specifics]
Topic 3: [Single generic sentence with no specifics]

## SLIDE STRUCTURE
\`\`\`xml
<SECTION layout="left" | "right" | "vertical">
  <!-- Required: include ONE layout component -->
  <!-- Required: include at least one detailed image query -->
</SECTION>
\`\`\`

## SECTION LAYOUTS
Vary the layout attribute in the SECTION tag to control image placement:
- layout="left" - Root image appears on the left side
- layout="right" - Root image appears on the right side
- layout="vertical" - Root image appears at the top

## AVAILABLE LAYOUTS
Choose ONE appropriate layout for the slide:

1. COLUMNS: For comparisons
\`\`\`xml
<COLUMNS>
  <DIV><H3>First Concept</H3><P>Description</P></DIV>
  <DIV><H3>Second Concept</H3><P>Description</P></DIV>
</COLUMNS>
\`\`\`

2. BULLETS: For key points
\`\`\`xml
<BULLETS>
  <DIV><H3>Main Point</H3><P>Description</P></DIV>
  <DIV><P>Second point with details</P></DIV>
</BULLETS>
\`\`\`

3. ICONS: For concepts with symbols
\`\`\`xml
<ICONS>
  <DIV><ICON query="rocket" /><H3>Innovation</H3><P>Description of innovation</P></DIV>
  <DIV><ICON query="shield" /><H3>Security</H3><P>Description of security</P></DIV>
  <DIV><ICON query="chart-line" /><H3>Growth</H3><P>Description of growth</P></DIV>
  <DIV><ICON query="lightbulb" /><H3>Ideas</H3><P>Description of ideas</P></DIV>
</ICONS>
\`\`\`

4. CYCLE: For processes and workflows
\`\`\`xml
<CYCLE>
  <DIV><H3>Research</H3><P>Initial exploration phase</P></DIV>
  <DIV><H3>Design</H3><P>Solution creation phase</P></DIV>
  <DIV><H3>Implement</H3><P>Execution phase</P></DIV>
  <DIV><H3>Evaluate</H3><P>Assessment phase</P></DIV>
</CYCLE>
\`\`\`

5. ARROWS: For cause-effect or flows
\`\`\`xml
<ARROWS>
  <DIV><H3>Challenge</H3><P>Current market problem</P></DIV>
  <DIV><H3>Solution</H3><P>Our innovative approach</P></DIV>
  <DIV><H3>Result</H3><P>Measurable outcomes</P></DIV>
</ARROWS>
\`\`\`

6. TIMELINE: For chronological progression
\`\`\`xml
<TIMELINE>
  <DIV><H3>2022</H3><P>Market research completed</P></DIV>
  <DIV><H3>2023</H3><P>Product development phase</P></DIV>
  <DIV><H3>2024</H3><P>Global market expansion</P></DIV>
</TIMELINE>
\`\`\`

7. PYRAMID: For hierarchical importance
\`\`\`xml
<PYRAMID>
  <DIV><H3>Vision</H3><P>Our aspirational goal</P></DIV>
  <DIV><H3>Strategy</H3><P>Key approaches to achieve vision</P></DIV>
  <DIV><H3>Tactics</H3><P>Specific implementation steps</P></DIV>
</PYRAMID>
\`\`\`

8. STAIRCASE: For progressive advancement
\`\`\`xml
<STAIRCASE>
  <DIV><H3>Basic</H3><P>Foundational capabilities</P></DIV>
  <DIV><H3>Advanced</H3><P>Enhanced features and benefits</P></DIV>
  <DIV><H3>Expert</H3><P>Premium capabilities and results</P></DIV>
</STAIRCASE>
\`\`\`

## STAIRCASE SLIDE REQUIREMENTS
- Each step in the staircase must have a short title (max 3-4 words) and a short paragraph (max 2-3 lines).
- Do not use long titles or long paragraphs in the staircase layout.
- Never overlap step titles and text; each step must be visually separated.
- If there is general explanatory text, place it outside the <STAIRCASE> block (before or after).
- Add extra visual spacing between the second and third step to improve readability using a comment <!-- extra space -->.
- Example:
  <STAIRCASE>
    <DIV><H3>Step 1</H3><P>Short description (max 2-3 lines).</P></DIV>
    <DIV><H3>Step 2</H3><P>Short description (max 2-3 lines).</P></DIV>
    <!-- extra space -->
    <DIV><H3>Step 3</H3><P>Short description (max 2-3 lines).</P></DIV>
  </STAIRCASE>

9. CHART: For data visualization
\`\`\`xml
<CHART charttype="vertical-bar">
  <TABLE>
    <TR><TD type="label"><VALUE>Q1</VALUE></TD><TD type="data"><VALUE>45</VALUE></TD></TR>
    <TR><TD type="label"><VALUE>Q2</VALUE></TD><TD type="data"><VALUE>72</VALUE></TD></TR>
    <TR><TD type="label"><VALUE>Q3</VALUE></TD><TD type="data"><VALUE>89</VALUE></TD></TR>
  </TABLE>
</CHART>
\`\`\`

10. IMAGES: Most slides need at least one
\`\`\`xml
<!-- Good image queries (detailed, specific): -->
<IMG query="futuristic smart city with renewable energy infrastructure and autonomous vehicles in morning light" />
<IMG query="close-up of microchip with circuit board patterns in blue and gold tones" />
<IMG query="diverse team of professionals collaborating in modern office with data visualizations" />

<!-- NOT just: "city", "microchip", "team meeting" -->
\`\`\`

## CONTENT EXPANSION STRATEGY
For the slide topic:
- Add supporting data/statistics
- Include real-world examples
- Reference industry trends
- Add thought-provoking questions

## CRITICAL RULES
1. Generate EXACTLY one slide. NOT MORE, NOT LESS!
2. NEVER repeat layouts in consecutive slides (consider the context of other slides)
3. DO NOT copy the topic verbatim - expand and enhance
4. Include at least one detailed image query in the slide
5. Use appropriate heading hierarchy
6. Vary the SECTION layout attribute (left/right/vertical)
7. EXTREMELY IMPORTANT: Keep (H1) titles VERY SHORT and CONCISE - MAXIMUM 6 WORDS
   - Titles must be brief, impactful, and focused
   - DO NOT use complete sentences as titles
   - DO NOT include phrases like "Aspects of" or "Introduction to" in titles
   - DO NOT use special characters like #, *, •, etc. in titles
   - NEVER start titles with "#" or include "#" anywhere in the title
   - REMOVE ALL "#" characters from titles completely
   - DO NOT start titles with "O que é", "Como funciona", etc.
   - BAD TITLE EXAMPLE: "# O Front Europeu - A luta entre os Aliados e o Eixo na Europa - Impacto da guerra na população civil e na economia"
   - GOOD TITLE EXAMPLE: "O Front Europeu"
8. Use subtitles (H2, H3) and paragraphs (P) for detailed content, not in the main title
9. NEVER include phrases like "Important aspects about [topic]" or "Tell me more about [topic]" in the content
10. NEVER repeat the original topic with introductory phrases like "Aspects to consider", "Considerations about", etc.
11. Treat the topic as the main subject, not as an instruction to be included in the slide
12. CRITICAL: When using layouts with multiple topics (COLUMNS, BULLETS, ICONS, etc.), ensure ALL topics have SUBSTANTIAL and BALANCED content
13. MANDATORY: Each secondary topic must have at least 2-3 full sentences, not just a generic sentence
14. REQUIRED: Maintain EQUAL content length and detail across ALL topics - if one topic has 3-4 sentences, all others should have similar length
15. CRITICAL: Never create slides where one topic has a detailed paragraph while others have only brief mentions
15. PRIORITIZE complex and varied layouts (COLUMNS, BULLETS, ICONS, CYCLE, ARROWS, TIMELINE, PYRAMID, STAIRCASE) instead of just plain text
16. Never repeat the same icon within a single slide. Each topic in an ICONS layout must have a unique and visually distinct icon that properly represents the concept.
17. For slides with 3 or more topics, do not include images unless the texts are very short.
18. For slides with CHART components:
    - NEVER include images - the chart itself is the visual element
    - Keep all text content concise and brief
    - Use short paragraphs (maximum 2-3 sentences each)
    - Focus on explaining the chart data, not adding additional context
19. For slides with tables: omit the image if the table is large; if small, you may include an image, preferably using a lateral layout ("left" or "right").

Now create a complete XML slide that significantly expands on the provided topic.
`;

// Modelo com temperatura padrão
const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,
  streaming: true,
});


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
  if (layouts.length === 0) {
    return `<SECTION layout="right">
  <H1>${topic}</H1>
  <P>Conteúdo sobre ${topic}</P>
  <IMG query="detailed visualization of ${topic}" />
</SECTION>`;
  }
  
  const randomIndex = Math.floor(Math.random() * layouts.length);
  return layouts[randomIndex]!;
}

/**
 * Adiciona um layout complexo a um XML existente
 */
function addComplexLayoutToXml(xml: string, topic: string, slideIndex?: number): string {
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
  const title: string = titleMatch && titleMatch[1] ? titleMatch[1] : topic;

  // Extrair o conteúdo de texto, se existir
  const contentMatch = xml.match(/<P>(.*?)<\/P>/i);
  const content: string = contentMatch && contentMatch[1] ? contentMatch[1] : `Conteúdo sobre ${topic}`;

  // Extrair a consulta de imagem, se existir
  const imgMatch = xml.match(/query="([^"]*)"/i);
  const imgQuery: string = imgMatch && imgMatch[1] ? imgMatch[1] : `detailed visualization of ${topic}`;

  // Extrair o atributo de layout, se existir
  const layoutMatch = xml.match(/layout="([^"]*)"/i);
  const layout = layoutMatch && layoutMatch[1] ? layoutMatch[1] : "right";

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
    <DIV><H3>Considerações</H3><P>Fatores relevantes e implicações de ${topic} no cenário atual.</P></DIV>
  </BULLETS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com bullets - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <BULLETS>
    <DIV><H3>Ponto Chave</H3><P>${content}</P></DIV>
    <DIV><H3>Considerações</H3><P>Fatores relevantes e implicações no cenário atual.</P></DIV>
    <DIV><H3>Aplicações</H3><P>Implementações práticas e casos de uso relevantes.</P></DIV>
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

  // Layout com ciclo - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <CYCLE>
    <DIV><H3>Fase 1</H3><P>${content}</P></DIV>
    <DIV><H3>Fase 2</H3><P>Desenvolvimento e evolução dos conceitos principais relacionados a ${topic}.</P></DIV>
    <DIV><H3>Fase 3</H3><P>Implementação e avaliação de resultados no contexto de ${topic}.</P></DIV>
  </CYCLE>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com timeline - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <TIMELINE>
    <DIV><H3>Passado</H3><P>Origens e desenvolvimento histórico de ${topic} com marcos importantes.</P></DIV>
    <DIV><H3>Presente</H3><P>${content}</P></DIV>
    <DIV><H3>Futuro</H3><P>Tendências emergentes e potencial de evolução nos próximos anos.</P></DIV>
  </TIMELINE>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com pyramid - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <PYRAMID>
    <DIV><H3>Visão</H3><P>${content}</P></DIV>
    <DIV><H3>Estratégia</H3><P>Abordagens-chave para alcançar resultados em ${topic}.</P></DIV>
    <DIV><H3>Táticas</H3><P>Etapas específicas de implementação e aplicação prática.</P></DIV>
  </PYRAMID>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Layout com arrows - versão com 3 itens
  complexLayouts.push(`<SECTION layout="${layout}">
  <H1>${title}</H1>
  <ARROWS>
    <DIV><H3>Desafio</H3><P>Problemas e obstáculos relacionados a ${topic}.</P></DIV>
    <DIV><H3>Solução</H3><P>${content}</P></DIV>
    <DIV><H3>Resultado</H3><P>Benefícios e impactos positivos alcançados.</P></DIV>
  </ARROWS>
  <IMG query="${imgQuery}" />
</SECTION>`);

  // Garantir que temos layouts disponíveis
  if (complexLayouts.length === 0) {
    return `<SECTION layout="right">
  <H1>${topic}</H1>
  <P>Conteúdo sobre ${topic}</P>
  <IMG query="detailed visualization of ${topic}" />
</SECTION>`;
  }

  // Usar o índice do slide para influenciar a escolha do layout
  // Isso garante que slides consecutivos tenham layouts diferentes
  let layoutIndex = 0;
  
  // Se temos um índice de slide, usamos ele para influenciar a escolha
  if (typeof slideIndex === 'number') {
    // Usar o módulo para garantir que o índice esteja dentro do intervalo
    layoutIndex = slideIndex % complexLayouts.length;
    
    // Adicionar um pouco de aleatoriedade para não ser totalmente previsível
    if (Math.random() > 0.7) {
      // 30% de chance de escolher um layout aleatório diferente
      const randomOffset = 1 + Math.floor(Math.random() * (complexLayouts.length - 1));
      layoutIndex = (layoutIndex + randomOffset) % complexLayouts.length;
    }
  } else {
    // Se não temos um índice, escolher aleatoriamente
    layoutIndex = Math.floor(Math.random() * complexLayouts.length);
  }
  
  return complexLayouts[layoutIndex]!;
}

/**
 * Função para analisar o número de tópicos e o tamanho do texto em um slide
 * Retorna informações sobre a quantidade de tópicos e se os textos são curtos, médios ou longos
 */
function analyzeSlideContent(xml: string): { 
  topicCount: number; 
  hasShortTexts: boolean;
  hasMediumTexts: boolean;
  hasLongTexts: boolean;
} {
  // Inicializar contadores
  let topicCount = 0;
  let shortTextCount = 0;
  let mediumTextCount = 0;
  let longTextCount = 0;
  
  // Contar DIVs em layouts complexos
  const divMatches = xml.match(/<DIV>/gi);
  if (divMatches) {
    topicCount = divMatches.length;
  }
  
  // Se não encontrou DIVs, pode ser um slide simples com apenas parágrafos
  if (topicCount === 0) {
    const pMatches = xml.match(/<P>(.*?)<\/P>/gi);
    if (pMatches) {
      topicCount = pMatches.length;
    }
  }
  
  // Analisar o tamanho dos textos nos parágrafos
  const paragraphRegex = /<P>(.*?)<\/P>/gi;
  let match;
  const paragraphs: string[] = [];
  
  while ((match = paragraphRegex.exec(xml)) !== null) {
    if (match[1]) {
      paragraphs.push(match[1]);
    }
  }
  
  // Classificar cada parágrafo por tamanho
  paragraphs.forEach(paragraph => {
    const words = paragraph.split(/\s+/).length;
    const lines = paragraph.split(/[.!?]/).length;
    
    if (words <= 15 || lines <= 1) {
      shortTextCount++;
    } else if (words <= 40 || lines <= 3) {
      mediumTextCount++;
    } else {
      longTextCount++;
    }
  });
  
  return {
    topicCount,
    hasShortTexts: shortTextCount > 0 && mediumTextCount === 0 && longTextCount === 0,
    hasMediumTexts: mediumTextCount > 0 && longTextCount === 0,
    hasLongTexts: longTextCount > 0
  };
}

/**
 * Função para aplicar as regras de densidade de conteúdo
 * Ajusta o layout e a presença de imagens com base no número de tópicos e tamanho do texto
 */
function applyContentDensityRules(xml: string, topic: string): string {
  // Analisar o conteúdo do slide
  const analysis = analyzeSlideContent(xml);
  
  // Verificar se o slide já tem um layout complexo
  const hasComplexLayout = 
    xml.includes("<COLUMNS") || 
    xml.includes("<BULLETS") || 
    xml.includes("<ICONS") || 
    xml.includes("<CYCLE") || 
    xml.includes("<ARROWS") || 
    xml.includes("<TIMELINE") || 
    xml.includes("<PYRAMID") || 
    xml.includes("<STAIRCASE") || 
    xml.includes("<CHART");
  
  // Extrair a consulta de imagem, se existir
  const imgMatch = xml.match(/<IMG query="([^"]*)"/i);
  const imgQuery = imgMatch && imgMatch[1] ? imgMatch[1] : `detailed visualization of ${topic}`;
  
  // Regra 1: Para slides com 1-2 tópicos, manter imagens com layout left/right
  if (analysis.topicCount <= 2) {
    // Não precisa fazer nada, manter como está
    return xml;
  }
  
  // Regra 2: Para slides com 3-4 tópicos com textos curtos, usar layout="vertical"
  if (analysis.topicCount >= 3 && analysis.topicCount <= 4 && analysis.hasShortTexts) {
    // Substituir o atributo layout por "vertical"
    let modifiedXml = xml.replace(/layout="(left|right)"/i, 'layout="vertical"');
    
    // Se não tinha layout, adicionar
    if (!modifiedXml.includes('layout="')) {
      modifiedXml = modifiedXml.replace(/<SECTION/i, '<SECTION layout="vertical"');
    }
    
    // Garantir que tem uma imagem
    if (!modifiedXml.includes("<IMG")) {
      modifiedXml = modifiedXml.replace(/<\/SECTION>/i, `<IMG query="${imgQuery}" /></SECTION>`);
    }
    
    return modifiedXml;
  }
  
  // Regra 3: Para slides com 3-4 tópicos com textos médios ou 5+ tópicos, remover imagens
  if ((analysis.topicCount >= 3 && analysis.topicCount <= 4 && analysis.hasMediumTexts) || analysis.topicCount >= 5) {
    // Remover a tag IMG
    return xml.replace(/<IMG[^>]*>/i, '');
  }
  
  // Se não se encaixar em nenhuma regra específica, retornar o XML original
  return xml;
}

/**
 * Função para forçar o formato correto para slides de introdução
 * Remove layouts complexos e garante que o slide tenha a estrutura esperada
 */
function enforceIntroSlideFormat(xml: string, userName: string, topic: string, language: string = 'en'): string {
  // Verificar se o XML contém layouts complexos
  const hasComplexLayout = 
    xml.includes("<COLUMNS") || 
    xml.includes("<BULLETS") || 
    xml.includes("<ICONS") || 
    xml.includes("<CYCLE") || 
    xml.includes("<ARROWS") || 
    xml.includes("<TIMELINE") || 
    xml.includes("<PYRAMID") || 
    xml.includes("<STAIRCASE") || 
    xml.includes("<CHART");
  
  // Se não tiver layouts complexos e já tiver o nome do usuário, retornar o XML original
  if (!hasComplexLayout && xml.includes("<h6") && xml.includes(userName)) {
    return xml;
  }
  
  console.log("Corrigindo formato do slide de introdução");
  
  // Extrair o título do slide, se existir
  const titleMatch = xml.match(/<H1>(.*?)<\/H1>/i);
  const title = titleMatch && titleMatch[1] ? titleMatch[1] : topic;
  
  // Extrair o conteúdo de texto, se existir
  // Tenta extrair parágrafos de texto
  const paragraphs: string[] = [];
  const paragraphRegex = /<P>(.*?)<\/P>/gi;
  let match;
  while ((match = paragraphRegex.exec(xml)) !== null) {
    paragraphs.push(match[1]);
  }
  
  // Se não encontrou parágrafos, usa o tópico como conteúdo
  const content = paragraphs.length > 0 
    ? paragraphs.join("</P><P>") 
    : `${topic} é um tema importante que merece atenção e análise detalhada.`;
  
  // Extrair a consulta de imagem, se existir
  const imgMatch = xml.match(/query="([^"]*)"/i);
  const imgQuery = imgMatch && imgMatch[1] 
    ? imgMatch[1] 
    : `detailed visualization of ${topic} with professional design elements`;
  
  // Determinar o texto "por" com base no idioma
  let byText = "by";
  if (language === 'pt' || language === 'pt-BR' || language === 'pt-PT') {
    byText = "por";
  } else if (language === 'es' || language === 'es-ES' || language === 'es-MX') {
    byText = "por";
  } else if (language === 'fr' || language === 'fr-FR' || language === 'fr-CA') {
    byText = "par";
  } else if (language === 'de' || language === 'de-DE') {
    byText = "von";
  } else if (language === 'it' || language === 'it-IT') {
    byText = "di";
  }
  
  // Gerar um layout de slide de introdução correto
  return `<SECTION layout="right">
  <H1>${title}</H1>
  <P>${content}</P>
  <h6 style="font-size: 1.5em; font-weight: bold">${byText} ${userName}</h6>
  <IMG query="${imgQuery}" />
</SECTION>`;
}

/**
 * Função para limpar e formatar títulos
 * Remove marcadores de lista, caracteres especiais e limita o comprimento
 */
function cleanTitle(title: string): string {
  // Remover marcadores de lista (hifens, asteriscos, números seguidos de ponto no início de linhas)
  let cleanedTitle = title.replace(/^[-*#]\s+/gm, '')
                          .replace(/^\d+\.\s+/gm, '')
                          .replace(/^[•○●]\s+/gm, '');
  
  // Remover caracteres # que podem estar no início (markdown)
  cleanedTitle = cleanedTitle.replace(/^#+\s+/, '');
  
  // Remover quebras de linha e substituir por espaços
  cleanedTitle = cleanedTitle.replace(/\n/g, ' ');
  
  // Remover pontuação excessiva no final
  cleanedTitle = cleanedTitle.replace(/[.,:;]+$/, '');
  
  // Remover espaços extras
  cleanedTitle = cleanedTitle.replace(/\s+/g, ' ').trim();
  
  // Limitar a 8 palavras
  const words = cleanedTitle.split(/\s+/);
  if (words.length > 8) {
    cleanedTitle = words.slice(0, 8).join(' ');
  }
  
  return cleanedTitle;
}

/**
 * Função para limitar o tamanho dos títulos em um XML
 * Processa o XML e trunca títulos muito longos, movendo o excesso para um parágrafo
 * Também remove caracteres indesejados e formata corretamente
 */
function limitTitleLength(xml: string): string {
  // Procurar por tags H1 com conteúdo muito longo
  const h1Regex = /<H1>(.*?)<\/H1>/gi;
  
  return xml.replace(h1Regex, (match, titleContent) => {
    // Limpar e formatar o título
    const cleanedTitle = cleanTitle(titleContent);
    
    // Se o título original e o limpo são diferentes, ou se o título é muito longo
    if (cleanedTitle !== titleContent.trim() || titleContent.split(/\s+/).length > 8) {
      // Extrair o conteúdo excedente (palavras após as primeiras 8)
      const originalWords = titleContent.trim().split(/\s+/);
      const restOfContent = originalWords.length > 8 ? originalWords.slice(8).join(' ') : '';
      
      // Verificar se já existe um parágrafo após o título
      const afterTitle = xml.substring(xml.indexOf(match) + match.length).trim();
      
      if (afterTitle.startsWith('<P>')) {
        // Se já existe um parágrafo, apenas truncar o título
        return `<H1>${cleanedTitle}</H1>`;
      } else if (restOfContent) {
        // Se não existe um parágrafo e temos conteúdo excedente, criar um com o conteúdo
        return `<H1>${cleanedTitle}</H1><P>${restOfContent}</P>`;
      } else {
        // Se não temos conteúdo excedente, apenas retornar o título limpo
        return `<H1>${cleanedTitle}</H1>`;
      }
    }
    
    // Se o título não precisou de limpeza, retorná-lo sem alterações
    return match;
  });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("=== DEBUG: Iniciando geração de slide ===");

    // Verificar se o usuário tem créditos suficientes para geração de slide (5 créditos)
    const creditCheck = await canExecuteAction(session.user.id, 'SLIDE_GENERATION');
    
    if (!creditCheck.allowed) {
      return NextResponse.json({
        error: `Créditos insuficientes. Necessário: ${creditCheck.cost}, disponível: ${creditCheck.currentCredits}`,
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
      }, { status: 402 });
    }

    const { title, topic, slideIndex, language, tone, context, userName, isIntroSlide, forceVariability } =
      (await req.json()) as SlideRegenerationRequest;

    if (!title || !topic || slideIndex === undefined || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    if (slideIndex === 0 && (!userName || userName.trim().length === 0)) {
      return NextResponse.json(
        { error: "Missing userName for introduction slide" },
        { status: 400 },
      );
    }

    // Verificar se é um slide de introdução (usando slideIndex ou a flag explícita)
    const useIntroTemplate = slideIndex === 0 || isIntroSlide === true;
    console.log("Usando template de introdução?", useIntroTemplate);
    
    // Ajustar a temperatura com base no parâmetro forceVariability
    // Temperatura mais alta para maior variabilidade quando forceVariability é true
    const temperature = forceVariability === true ? 0.9 : 0.7;
    model.temperature = temperature;
    
    // Criar instruções de variabilidade para regenerações
    const variabilityInstructions = forceVariability === true ? `
## VARIABILITY REQUIREMENTS
- IMPORTANT: Generate a slide with a COMPLETELY DIFFERENT structure than before
- DO NOT use the same layout component as the previous slide
- If the previous slide used COLUMNS, use a different layout like CYCLE, TIMELINE, or PYRAMID
- If the previous slide used BULLETS, use a different layout like ICONS, ARROWS, or STAIRCASE
- Completely rephrase all content, don't just paraphrase
- Use a different perspective or approach to the topic
- If possible, use a different image placement (left/right/vertical)
- CRITICAL: Ensure the new slide looks and feels distinctly different from the previous version
` : '';

    // Usar prompt especial para o slide de introdução
    const prompt = useIntroTemplate
      ? PromptTemplate.fromTemplate(introSlideTemplate)
      : PromptTemplate.fromTemplate(singleSlideTemplate + variabilityInstructions);
    const stringOutputParser = new StringOutputParser();
    const chain = RunnableSequence.from([prompt, model, stringOutputParser]);

    // Usar invoke em vez de stream para poder validar o resultado antes de retornar
    try {
      // Formatar o contexto para o prompt
      const formattedContext = context && context.length > 0 
        ? context.map((text, idx) => `Slide ${idx + 1}: ${text}`).join('\n')
        : "Nenhum contexto disponível";

      // Variável para controlar logs de debug
      const DEBUG_LOGS = process.env.NODE_ENV === 'development' && false; // Definir como true para ativar logs
      
      const result = await chain.invoke({
        TITLE: title,
        TOPIC: topic,
        SLIDE_INDEX: slideIndex + 1, // Converter para número baseado em 1 para o prompt
        LANGUAGE: language,
        TONE: tone || "professional",
        CONTEXT: formattedContext,
        USER_NAME: userName ?? "User"
      });
      
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
      
      // Verificar se o XML tem conteúdo substancial
      const hasSubstantialContent = 
        (result.match(/<P>/g) || []).length >= 3 || // Pelo menos 3 parágrafos
        result.length > 500; // Ou mais de 500 caracteres
      
      // Validação mais relaxada - apenas verificar se há alguma tag SECTION
      if (!result.includes("<SECTION")) {
        if (DEBUG_LOGS) console.log("XML sem tag SECTION, usando fallback variado");
        // Escolher um fallback aleatório com layout mais complexo
        return new Response(getRandomFallbackXml(topic, slideIndex));
      }
      
      // Garantir que o XML tenha uma tag SECTION de fechamento
      let finalXml = result;
      if (!finalXml.includes("</SECTION>")) {
        finalXml += "</SECTION>";
      }
      
      // Limitar o tamanho dos títulos
      finalXml = limitTitleLength(finalXml);
      
      // Se não tiver layout complexo, adicionar um na maioria dos casos
      if (!hasComplexLayout) {
        // 70% de chance de adicionar layout complexo, mesmo com conteúdo substancial
        if (Math.random() > 0.3) {
          if (DEBUG_LOGS) console.log("XML sem layout complexo, adicionando layout complexo");
          finalXml = addComplexLayoutToXml(finalXml, topic, slideIndex);
        } else if (DEBUG_LOGS) {
          console.log("Mantendo layout simples para este slide (30% de chance)");
        }
      }
      
      // Para slides de introdução, forçar o formato correto
      if (useIntroTemplate) {
        finalXml = enforceIntroSlideFormat(finalXml, userName, topic, language);
      } else {
        // Para slides normais, aplicar regras de densidade de conteúdo
        finalXml = applyContentDensityRules(finalXml, topic);
      }
      
      // Consumir créditos após geração bem-sucedida
      const consumeResult = await consumeSlideGenerationCredits(session.user.id);
      if (!consumeResult.success) {
        console.error('Error consuming credits:', consumeResult.message);
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
