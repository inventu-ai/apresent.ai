import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { canConsumeCredits, consumeCredits, canCreateCards, checkAndResetCreditsIfNeeded, consumePresentationCreationCredits, canExecuteAction } from "@/lib/credit-system";

interface SlidesRequest {
  title: string; // Presentation title
  outline: string[]; // Array of main topics with markdown content
  language: string; // Language to use for the slides
  tone: string; // Style for image queries (optional)
}

interface PresentationRequest {
  title: string;
  outline: string[];
  language: string;
  tone: string;
}

const slidesTemplate = `
You are an expert presentation designer.Your task is to create an engaging presentation in XML format.
## CORE REQUIREMENTS

1. FORMAT: Use <SECTION> tags for each slide
2. CONTENT: DO NOT copy outline verbatim - expand with examples, data, and context
3. VARIETY: Each slide must use a DIFFERENT layout component
4. VISUALS: Include detailed image queries (10+ words) on every slide

## FIRST SLIDE (INTRODUCTION) REQUIREMENTS
- The first slide of the presentation must always be an introduction to the topic.
- The first slide must always include a large, bold title (H1) with the main subject of the presentation. If the title is missing, use the presentation title.
- Below the title, write a short introduction or summary (1-2 paragraphs) that contextualizes the topic, provides key facts, definitions, or impactful data.
- The introduction text must be concise:
  - If there are two paragraphs, each paragraph must have a maximum of 3 lines (short, objective sentences).
  - If there is only one paragraph, it can have up to 7 lines maximum.
  - Avoid excessive spacing between paragraphs; the text should be visually compact.
  - Do not use long sentences or large blocks of text.
  - Example (two paragraphs, max 3 lines each):
    <P>First paragraph, up to 3 lines.</P>
    <P>Second paragraph, up to 3 lines.</P>
  - Example (one paragraph, max 7 lines):
    <P>Single paragraph, up to 7 lines.</P>
- Do NOT use bullet points or multiple topics on this slide.
- Add a large, relevant and visually striking image on either the right or left side of the slide (use layout="right" or "left").
- Always display the user's name (e.g., "by {USER_NAME}") on the introduction slide, below the introduction text, using ONLY the <h6> tag for maximum visual highlight.
- Example: <h6>por {USER_NAME}</h6>
- If the user's name is not inside <h6>, the answer is INVALID.
- Use "by" in English, "por" in Portuguese, "por" in Spanish, "par" in French, etc., according to the slide language.

## PRESENTATION DETAILS
- Title: {TITLE}
- Outline (for reference only): {OUTLINE_FORMATTED}
- Language: {LANGUAGE}
- Tone: {TONE}
- Total Slides: {TOTAL_SLIDES}

## CONTENT DENSITY MANAGEMENT
- For slides with 1-2 topics: include images normally.
- For slides with 3 or more topics: do NOT include images, except if the texts are very short.
- For slides with charts or tables: if necessary, omit the image completely; if the chart or table is small, you may include an image.
- For slides with charts or tables: if you include an image, use "left" or "right" layout to position the image laterally.

## CONTENT BALANCING
- Prioritize readability over the number of visual elements.
- Slides with many topics (3+) should focus on textual content without additional images.
- Avoid overloading slides with too many elements (text + image + icons).

## PRESENTATION STRUCTURE
\`\`\`xml
<PRESENTATION>

<!--Every slide must follow this structure (layout determines where the image appears) -->
<SECTION layout="left" | "right" | "vertical">
  <!-- Required: include ONE layout component per slide -->
  <!-- Required: include at least one detailed image query -->
</SECTION>

<!-- Other Slides in the SECTION tag-->

</PRESENTATION>
\`\`\`

## SECTION LAYOUTS
Vary the layout attribute in each SECTION tag to control image placement:
- layout="left" - Root image appears on the left side
- layout="right" - Root image appears on the right side
- layout="vertical" - Root image appears at the top

Use all three layouts throughout the presentation for visual variety.

## AVAILABLE LAYOUTS
Choose ONE different layout for each slide:

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
- Add extra visual spacing between the second and third step to improve readability. You can use a comment <!-- extra space -->, a <BR/>, or add style="margin-top:2em" to the third <DIV> if supported.
- Example:
  <STAIRCASE>
    <DIV><H3>Step 1</H3><P>Short description (max 2-3 lines).</P></DIV>
    <DIV><H3>Step 2</H3><P>Short description (max 2-3 lines).</P></DIV>
    <!-- extra space -->
    <DIV style="margin-top:2em"><H3>Step 3</H3><P>Short description (max 2-3 lines).</P></DIV>
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

10. IMAGES: Most slides needs at least one
\`\`\`xml
<!-- Good image queries (detailed, specific): -->
<IMG query="futuristic smart city with renewable energy infrastructure and autonomous vehicles in morning light" />
<IMG query="close-up of microchip with circuit board patterns in blue and gold tones" />
<IMG query="diverse team of professionals collaborating in modern office with data visualizations" />

<!-- NOT just: "city", "microchip", "team meeting" -->
\`\`\`

## CONTENT EXPANSION STRATEGY
For each outline point:
- Add supporting data/statistics
- Include real-world examples
- Reference industry trends
- Add thought-provoking questions

## CRITICAL RULES
1. Generate exactly {TOTAL_SLIDES} slides. NOT MORE NOT LESS ! EXACTLY {TOTAL_SLIDES}
2. NEVER repeat layouts in consecutive slides
3. DO NOT copy outline verbatim - expand and enhance
4. Include at least one detailed image query in most of the slides
5. Use appropriate heading hierarchy
6. Vary the SECTION layout attribute (left/right/vertical) throughout the presentation
   - Use each layout (left, right, vertical) at least twice
   - Don't use the same layout more than twice in a row
7. Never repeat the same icon within a single slide. Each topic in an ICONS layout must have a unique and visually distinct icon that properly represents the concept.
8. If the user does not select an icon manually, always choose a unique and contextually relevant icon for each topic. Never use the same icon for different topics in the same slide. Avoid using the first icon in the list as a default for all topics.
9. For slides with 3 or more topics, do not include images unless the texts are very short.
9. For slides with charts or tables, omit the image if the chart/table is large; if small, you may include an image, preferably using a lateral layout ("left" or "right").

Now create a complete XML presentation with {TOTAL_SLIDES} slides that significantly expands on the outline.
`;

const model = new ChatOpenAI({
  modelName: "gpt-4.1-mini-2025-04-14",
  temperature: 0.7,
  streaming: true,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se o usuário tem créditos suficientes para criação de apresentação completa (40 créditos)
    const creditCheck = await canExecuteAction(session.user.id, 'PRESENTATION_CREATION');
    
    if (!creditCheck.allowed) {
      return NextResponse.json({
        error: `Créditos insuficientes. Necessário: ${creditCheck.cost}, disponível: ${creditCheck.currentCredits}`,
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
      }, { status: 402 });
    }

    const { title, outline, language, tone, userName } =
      (await req.json()) as SlidesRequest & { userName?: string };

    if (!title || !outline || !Array.isArray(outline) || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const slideCount = outline.length;

    // Verificar se precisa resetar créditos
    await checkAndResetCreditsIfNeeded(session.user.id);

    // Verificar se o usuário pode criar esta quantidade de cards
    const cardCheck = await canCreateCards(session.user.id, slideCount);
    if (!cardCheck.allowed) {
      return NextResponse.json(
        { 
          error: cardCheck.message || "Limite de cards excedido",
          maxCards: cardCheck.maxCards,
          planName: cardCheck.planName
        },
        { status: 403 }
      );
    }

    // Verificar se o usuário tem créditos suficientes (custo fixo de 40 créditos)
    const presentationCreditCheck = await canConsumeCredits(session.user.id, 'PRESENTATION_CREATION', 1);
    
    if (!presentationCreditCheck.allowed) {
      return NextResponse.json(
        { 
          error: "Créditos insuficientes para criar a apresentação",
          creditsNeeded: presentationCreditCheck.cost,
          currentCredits: presentationCreditCheck.currentCredits
        },
        { status: 403 }
      );
    }

    // Consumir créditos para criação de apresentação (40 créditos fixos)
    const consumeResult = await consumePresentationCreationCredits(session.user.id);
    if (!consumeResult.success) {
      return NextResponse.json(
        { error: "Erro ao consumir créditos" },
        { status: 500 }
      );
    }

    const prompt = PromptTemplate.fromTemplate(slidesTemplate);
    const stringOutputParser = new StringOutputParser();
    const chain = RunnableSequence.from([prompt, model, stringOutputParser]);

    const stream = await chain.stream({
      TITLE: title,
      LANGUAGE: language,
      TONE: tone,
      OUTLINE_FORMATTED: outline.join("\n\n"),
      TOTAL_SLIDES: outline.length,
      USER_NAME: userName ?? "User"
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error("Error in presentation generation:", error);
    return NextResponse.json(
      { error: "Failed to generate presentation slides" },
      { status: 500 },
    );
  }
}
