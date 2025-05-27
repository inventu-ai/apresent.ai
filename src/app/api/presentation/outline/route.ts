import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

interface OutlineRequest {
  prompt: string;
  numberOfCards: number;
  language: string;
}

// Function to extract number of slides from prompt
function extractNumberOfSlides(prompt: string): number {
  if (!prompt || typeof prompt !== 'string') {
    return 7;
  }

  // Common patterns for slide numbers in different languages
  const patterns = [
    // English patterns
    /(\d+)\s*slides?/i,
    /(\d+)\s*slide/i,
    /with\s*(\d+)\s*slides?/i,
    /make\s*(\d+)\s*slides?/i,
    /create\s*(\d+)\s*slides?/i,
    /generate\s*(\d+)\s*slides?/i,
    
    // Portuguese patterns
    /(\d+)\s*slides?/i,
    /(\d+)\s*slide/i,
    /com\s*(\d+)\s*slides?/i,
    /fazer\s*(\d+)\s*slides?/i,
    /criar\s*(\d+)\s*slides?/i,
    /gerar\s*(\d+)\s*slides?/i,
    /(\d+)\s*lâminas?/i,
    
    // Spanish patterns
    /(\d+)\s*diapositivas?/i,
    /con\s*(\d+)\s*diapositivas?/i,
    /hacer\s*(\d+)\s*diapositivas?/i,
    /crear\s*(\d+)\s*diapositivas?/i,
    
    // French patterns
    /(\d+)\s*diapositives?/i,
    /avec\s*(\d+)\s*diapositives?/i,
    /faire\s*(\d+)\s*diapositives?/i,
    /créer\s*(\d+)\s*diapositives?/i,
    
    // Generic number patterns
    /(\d+)\s*topics?/i,
    /(\d+)\s*sections?/i,
    /(\d+)\s*parts?/i,
    /(\d+)\s*points?/i,
    /(\d+)\s*tópicos?/i,
    /(\d+)\s*seções?/i,
    /(\d+)\s*partes?/i,
    /(\d+)\s*pontos?/i,
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      // Validate reasonable range (3-20 slides)
      if (num >= 3 && num <= 20) {
        return num;
      }
    }
  }

  // Default to 7 slides if no number found
  return 7;
}

const outlineTemplate = `Analyze the language of this presentation topic and generate a structured outline with {numberOfCards} main topics in markdown format.

IMPORTANT: Generate the outline in the SAME LANGUAGE as the input topic.
- If the input is in Portuguese, respond entirely in Portuguese
- If the input is in English, respond entirely in English  
- If the input is in Spanish, respond entirely in Spanish
- If the input is in French, respond entirely in French
- And so on for any other language detected

Topic: {prompt}

Generate exactly {numberOfCards} main topics that would make for an engaging and well-structured presentation. 
Format the response as markdown content, with each topic as a heading followed by 2-3 bullet points.

Example format (adapt to detected language):
# First Main Topic
- Key point about this topic
- Another important aspect
- Brief conclusion or impact

# Second Main Topic
- Main insight for this section
- Supporting detail or example
- Practical application or takeaway

# Third Main Topic 
- Primary concept to understand
- Evidence or data point
- Conclusion or future direction

Make sure the topics:
1. Flow logically from one to another
2. Cover the key aspects of the main topic
3. Are clear and concise
4. Are engaging for the audience
5. ALWAYS use bullet points (not paragraphs) and format each point as "- point text"
6. Do not use bold, italic or underline
7. Keep each bullet point brief - just one sentence per point
8. Include exactly 2-3 bullet points per topic (not more, not less)
9. Use the SAME LANGUAGE as the input topic throughout the entire response`;

const outlineChain = RunnableSequence.from([
  PromptTemplate.fromTemplate(outlineTemplate),
  new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0.7,
    streaming: true,
  }),
]);

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, numberOfCards, language } =
      (await req.json()) as OutlineRequest;

    if (!prompt || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Extract number of slides from prompt, fallback to provided numberOfCards or 7
    const detectedSlides = extractNumberOfSlides(prompt);
    const finalNumberOfCards = detectedSlides !== 7 ? detectedSlides : (numberOfCards || 7);

    console.log(`Prompt: "${prompt}"`);
    console.log(`Detected slides: ${detectedSlides}`);
    console.log(`Final number of cards: ${finalNumberOfCards}`);

    const stream = await outlineChain.stream({
      prompt,
      numberOfCards: finalNumberOfCards,
      language,
    });

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error("Error in outline generation:", error);
    return NextResponse.json(
      { error: "Failed to generate outline" },
      { status: 500 },
    );
  }
}
