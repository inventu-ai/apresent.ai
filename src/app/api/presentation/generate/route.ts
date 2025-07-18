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

### ⚠️ CRITICAL: COMPONENT-SPECIFIC RULES ALWAYS OVERRIDE GENERAL RULES ⚠️
### FOLLOW THESE RULES FIRST AND FOREMOST:
- For slides with COLUMNS components:
  - This is a CONTENT-FOCUSED slide type - allow longer, more detailed text
  - Each column should have substantial content: 4-6 lines per paragraph for rich comparisons
  - Use any layout (left/right/vertical) based on content needs
  - Focus on providing detailed, informative content for effective comparisons
  - Prioritize content depth over brevity for this slide type
- For slides with BULLETS components:
  - With 2 topics: MUST use layout="left" or layout="right" (lateral positioning)
  - With 3-4 topics: MUST use layout="vertical" (image at the top only) - NEVER lateral
  - With 5-6 topics: do NOT include images - focus solely on content
  - Always keep text concise: maximum 2-3 lines per paragraph to maintain readability
- For slides with ICONS components: ALWAYS use layout="vertical" (image at the top) - NEVER use layout="left" or layout="right" to avoid visual conflict with icons.
- For slides with CHART components: NEVER include images - charts are the visual focus of the slide.
- For slides with CHART components: use SHORT to MEDIUM length texts only (maximum 2-3 sentences per paragraph).
- For slides with tables: if necessary, omit the image completely; if the table is small, you may include an image.
- For slides with tables: if you include an image, use "left" or "right" layout to position the image laterally.

### GENERAL RULES (for other slide types):
- For slides with 1-2 topics: include images normally with layout="left" or layout="right".
- For slides with 3-4 topics with SHORT texts (1-2 lines each): use layout="vertical" (image at the top).
- For slides with 3-4 topics with MEDIUM texts (3+ lines each): do NOT include images at all.
- For slides with 5+ topics: NEVER include images regardless of text length.

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

## COLUMNS SLIDE REQUIREMENTS
- This is a CONTENT-FOCUSED slide type designed for detailed comparisons
- Each column should contain substantial, informative content: 4-6 lines per paragraph
- Provide rich, detailed descriptions that enable effective comparison between concepts
- Include specific examples, data, statistics, or case studies when relevant
- Use any layout (left/right/vertical) based on content and visual balance needs
- Prioritize content depth and informativeness over brevity
- Each column should have enough detail to stand alone as valuable information
- Example with detailed content:
  <COLUMNS>
    <DIV><H3>Traditional Approach</H3><P>Detailed explanation of the traditional method, including its historical context, key characteristics, advantages, and typical use cases. This should provide comprehensive understanding of the approach and its implications in real-world scenarios.</P></DIV>
    <DIV><H3>Modern Alternative</H3><P>Comprehensive description of the modern alternative, covering its innovative aspects, technological foundations, benefits, and practical applications. Include specific examples and measurable outcomes to illustrate its effectiveness.</P></DIV>
  </COLUMNS>

2. BULLETS: For key points
\`\`\`xml
<BULLETS>
  <DIV><H3>Main Point</H3><P>Description</P></DIV>
  <DIV><P>Second point with details</P></DIV>
</BULLETS>
\`\`\`

## BULLETS SLIDE REQUIREMENTS - MANDATORY RULES
⚠️ **CRITICAL: THESE RULES ARE ABSOLUTELY MANDATORY - NO EXCEPTIONS ALLOWED** ⚠️

### **IMAGE POSITIONING RULES (STRICTLY ENFORCED):**
- **2 topics ONLY**: MUST use layout="left" OR layout="right" (lateral positioning)
- **3-4 topics**: MUST use layout="vertical" (image at top) - NEVER lateral positioning
- **5-6 topics**: NO images allowed - focus entirely on content

### **FORBIDDEN COMBINATIONS (WILL CAUSE SYSTEM FAILURE):**
❌ **NEVER use layout="left" or layout="right" with 3+ topics**
❌ **NEVER place images laterally when there are 3 or more bullet points**
❌ **NEVER violate the vertical layout rule for 3-4 topics**

### **TEXT REQUIREMENTS:**
- Each bullet point: maximum 3-4 lines per paragraph
- Avoid long paragraphs that overwhelm slide layout
- Each DIV: either H3+P or just P for visual hierarchy

### **MANDATORY EXAMPLES:**
**✅ CORRECT - 2 topics with lateral image:**
\`\`\`xml
<SECTION layout="right">
  <BULLETS>
    <DIV><H3>Point 1</H3><P>Description</P></DIV>
    <DIV><H3>Point 2</H3><P>Description</P></DIV>
  </BULLETS>
  <IMG query="detailed image description" />
</SECTION>
\`\`\`

**✅ CORRECT - 3 topics with top image:**
\`\`\`xml
<SECTION layout="vertical">
  <BULLETS>
    <DIV><H3>Point 1</H3><P>Description</P></DIV>
    <DIV><H3>Point 2</H3><P>Description</P></DIV>
    <DIV><H3>Point 3</H3><P>Description</P></DIV>
  </BULLETS>
  <IMG query="detailed image description" />
</SECTION>
\`\`\`

**❌ FORBIDDEN - 3 topics with lateral image:**
\`\`\`xml
<SECTION layout="right"> <!-- THIS IS FORBIDDEN -->
  <BULLETS>
    <DIV><H3>Point 1</H3><P>Description</P></DIV>
    <DIV><H3>Point 2</H3><P>Description</P></DIV>
    <DIV><H3>Point 3</H3><P>Description</P></DIV>
  </BULLETS>
  <IMG query="image" />
</SECTION>
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

5. ARROWS: For sequential processes and progressive advancement
\`\`\`xml
<ARROWS>
  <DIV><H3>Basic</H3><P>Foundational capabilities and initial steps</P></DIV>
  <DIV><H3>Advanced</H3><P>Enhanced features and improved processes</P></DIV>
  <DIV><H3>Expert</H3><P>Premium capabilities and optimal results</P></DIV>
</ARROWS>
\`\`\`

## ARROWS SLIDE REQUIREMENTS
- Use for showing progressive advancement, step-by-step improvement, or sequential development
- Each step should build upon the previous one, showing clear progression
- Ideal for showing evolution, maturity levels, or development stages
- Each DIV should have a short title (max 3-4 words) and a descriptive paragraph (max 2-3 lines)
- Focus on progression: Basic → Intermediate → Advanced, or Step 1 → Step 2 → Step 3
- Use when you want to show how something develops or improves over time
- Examples: skill development, product evolution, process improvement, learning stages

6. TIMELINE: For chronological progression
\`\`\`xml
<TIMELINE style="vertical">
  <DIV><H3>2022</H3><P>Market research completed</P></DIV>
  <DIV><H3>2023</H3><P>Product development phase</P></DIV>
  <DIV><H3>2024</H3><P>Global market expansion</P></DIV>
  <DIV><H3>2025</H3><P>International partnerships</P></DIV>
  <DIV><H3>2026</H3><P>New product line launch</P></DIV>
</TIMELINE>
\`\`\`

## TIMELINE SLIDE REQUIREMENTS
- Each timeline must have between 3 and 5 items (DIVs).
- When using more than 3 items, reduce the spacing between items to maintain slide readability.
- Each item should have a short title (H3) and a concise description (P).
- Timeline items are automatically numbered with circular markers.
- For timeline slides, only place images on the sides of the slide (left or right layout), never at the top.
- Images are optional for timeline slides - only include them when necessary to enhance understanding of the content.
- Example of vertical timeline:
  <TIMELINE style="vertical">
    <DIV><H3>2022</H3><P>Short description (max 2-3 lines).</P></DIV>
    <DIV><H3>2023</H3><P>Short description (max 2-3 lines).</P></DIV>
    <DIV><H3>2024</H3><P>Short description (max 2-3 lines).</P></DIV>
    <DIV><H3>2025</H3><P>Short description (max 2-3 lines).</P></DIV>
  </TIMELINE>

7. PYRAMID: For hierarchical importance
\`\`\`xml
<PYRAMID>
  <DIV><H3>Vision</H3><P>Our aspirational goal</P></DIV>
  <DIV><H3>Strategy</H3><P>Key approaches to achieve vision</P></DIV>
  <DIV><H3>Tactics</H3><P>Specific implementation steps</P></DIV>
</PYRAMID>
\`\`\`

8. STAIRCASE: For hierarchical levels and cause-effect relationships
\`\`\`xml
<STAIRCASE>
  <DIV><H3>Problem</H3><P>Current challenge or issue that needs addressing</P></DIV>
  <DIV><H3>Solution</H3><P>Proposed approach or method to solve the problem</P></DIV>
  <DIV><H3>Result</H3><P>Expected outcome or measurable impact achieved</P></DIV>
</STAIRCASE>
\`\`\`

## STAIRCASE SLIDE REQUIREMENTS
- Use for showing hierarchical relationships, cause-effect chains, or problem-solution flows
- Perfect for showing how one thing leads to another in a logical sequence
- Each level should represent a different tier of importance, complexity, or causality
- Each DIV should have a short title (max 3-4 words) and a descriptive paragraph (max 2-3 lines)
- Focus on logical connections: Problem → Solution → Result, or Cause → Effect → Impact
- Use when you want to show hierarchical structures, rankings, or causal relationships
- Examples: problem-solving processes, cause-effect chains, organizational hierarchies, priority levels
- Never overlap step titles and text; each step must be visually separated
- If there is general explanatory text, place it outside the <STAIRCASE> block (before or after)

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
9. For slides with 3 or more topics, do not include images unless the texts are very short. EXCEPTION: This rule does NOT apply to BULLETS, ICONS, TIMELINE, or other components with specific layout rules defined below.
10. For slides with CHART components:
    - NEVER include images - the chart itself is the visual element
    - Keep all text content concise and brief
    - Use short paragraphs (maximum 2-3 sentences each)
    - Focus on explaining the chart data, not adding additional context
11. For slides with tables: omit the image if the table is large; if small, you may include an image, preferably using a lateral layout ("left" or "right").
12. For TIMELINE components:
    - Include between 3 and 5 items (DIVs)
    - Ensure each item has a concise title and description
    - Only place images on the sides of the slide (left or right layout), never at the top
    - Images are optional - only include them when necessary to enhance understanding
13. For ICONS components:
    - ALWAYS use layout="vertical" to place images at the top of the slide
    - NEVER use layout="left" or layout="right" to avoid visual conflict between images and icons
    - This ensures icons remain the primary visual focus in the content area
14. ⚠️ MANDATORY FOR BULLETS components - NO EXCEPTIONS:
    - With 2 topics: MUST use layout="left" or layout="right" for lateral image positioning
    - With 3-4 topics: MUST use layout="vertical" to place images at the top only - NEVER use layout="left" or layout="right"
    - With 5-6 topics: do NOT include images - focus entirely on content
    - Keep all text concise: maximum 3-4 lines per paragraph for optimal readability
    - Avoid long paragraphs that could overwhelm the slide layout
    - VIOLATION OF THESE RULES IS STRICTLY FORBIDDEN
15. ⚠️ MANDATORY FOR COLUMNS components - CONTENT-FOCUSED SLIDE TYPE:
    - This is a CONTENT-RICH slide type designed for detailed comparisons
    - Each column MUST contain substantial content: 4-6 lines per paragraph minimum
    - Provide comprehensive, detailed descriptions with examples, data, and context
    - Include specific case studies, statistics, or real-world applications when relevant
    - Use any layout (left/right/vertical) based on content balance and visual needs
    - Prioritize content depth and informativeness over brevity
    - Each column should provide enough detail to enable meaningful comparison

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
