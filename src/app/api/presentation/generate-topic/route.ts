import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { consumeTopicRegenerationCredits, canExecuteAction } from "@/lib/credit-system";

interface TopicRequest {
  suggestion: string;
  existingTopics: string[];
  language: string;
  isRegeneration?: boolean;
}

const topicTemplate = `Given the following user suggestion and the existing presentation outline, generate a well-structured topic in markdown format.
The topic should be in {language}.

User suggestion: {suggestion}

Existing outline topics:
{existingTopics}

Generate a single comprehensive topic that would fit well within the existing presentation structure. The topic should be based on the user's suggestion.
Format the response as PLAIN TEXT markdown content, with the topic as a heading followed by 2-3 bullet points.

Example format:
# Topic Title That Matches User Suggestion
- Key point about this topic with specific data or example
- Another important aspect with practical application
- Brief conclusion or impact statement

CRITICAL FORMATTING RULES:
1. Return ONLY plain text without any special formatting, tokens, or markers
2. DO NOT include any tokens like "0:", line numbers, or any other non-content markers
3. DO NOT split words across multiple lines - keep all content on continuous lines
4. DO NOT add any JSON formatting, quotes around the content, or escape characters
5. NEVER return the content in a tokenized or stream format

Make sure the topic:
1. Addresses the user's suggestion directly and comprehensively
2. Fits well with the existing topics and overall presentation flow
3. Is clear, concise, and professionally structured
4. Is engaging and visually adaptable for presentation slides
5. ALWAYS use bullet points (not paragraphs) and format each point as "- point text"
6. Do not use bold, italic or underline formatting
7. Keep each bullet point brief - just one sentence per point
8. Include exactly 2-3 bullet points (not more, not less)
9. AVOID using any special characters or symbols that might interfere with XML parsing
10. Use only standard ASCII characters when possible (avoid curly quotes, em dashes, etc.)
11. Keep all text on a single line without manual line breaks
12. Each bullet point should be substantial enough to support a visual element`;

const regenerationTemplate = `You are improving an existing presentation topic. Take the current topic and make it better while keeping the same general theme.
The improved topic should be in {language}.

Current topic to improve: {suggestion}

Other topics in the presentation:
{existingTopics}

Improve the current topic by making it:
- More engaging and compelling
- Better structured and clearer
- More detailed and informative
- Better aligned with the overall presentation flow

Format the response as PLAIN TEXT markdown content, with the topic as a heading followed by 2-3 bullet points.

Example format:
# Improved Topic Title
- Enhanced key point about this topic with specific data or example
- More detailed important aspect with practical application
- Stronger conclusion or impact statement

CRITICAL FORMATTING RULES:
1. Return ONLY plain text without any special formatting, tokens, or markers
2. DO NOT include any tokens like "0:", line numbers, or any other non-content markers
3. DO NOT split words across multiple lines - keep all content on continuous lines
4. DO NOT add any JSON formatting, quotes around the content, or escape characters
5. NEVER return the content in a tokenized or stream format

Make sure the improved topic:
1. Maintains the core theme of the original topic
2. Is more engaging and professional
3. Fits well with the existing topics
4. Is clear and concise
5. ALWAYS use bullet points (not paragraphs) and format each point as "- point text"
6. Do not use bold, italic or underline formatting
7. Keep each bullet point brief - just one sentence per point
8. Include exactly 2-3 bullet points (not more, not less)
9. AVOID using any special characters or symbols that might interfere with XML parsing
10. Use only standard ASCII characters when possible (avoid curly quotes, em dashes, etc.)
11. Keep all text on a single line without manual line breaks
12. Each bullet point should be substantial enough to support a visual element`;

const createTopicChain = (isRegeneration: boolean) => RunnableSequence.from([
  PromptTemplate.fromTemplate(isRegeneration ? regenerationTemplate : topicTemplate),
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

    const { suggestion, existingTopics, language, isRegeneration = false } =
      (await req.json()) as TopicRequest;

    // Verificar se o usuário tem créditos suficientes para regeneração de tópico (2 créditos)
    const creditCheck = await canExecuteAction(session.user.id, 'TOPIC_REGENERATION');
    
    if (!creditCheck.allowed) {
      return NextResponse.json({
        error: `Créditos insuficientes. Necessário: ${creditCheck.cost}, disponível: ${creditCheck.currentCredits}`,
        creditsNeeded: creditCheck.cost,
        currentCredits: creditCheck.currentCredits,
      }, { status: 402 });
    }

    if (!suggestion || !existingTopics || !language) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Format existing topics for the prompt
    const formattedTopics = existingTopics
      .map((topic, index) => `${index + 1}. ${topic.replace(/^# /, '')}`)
      .join('\n');

    const topicChain = createTopicChain(isRegeneration);
    const stream = await topicChain.stream({
      suggestion,
      existingTopics: formattedTopics,
      language,
    });

    // Consumir créditos após geração bem-sucedida
    const consumeResult = await consumeTopicRegenerationCredits(session.user.id);
    if (!consumeResult.success) {
      console.error('Error consuming credits:', consumeResult.message);
    }

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error("Error in topic generation:", error);
    return NextResponse.json(
      { error: "Failed to generate topic" },
      { status: 500 },
    );
  }
}
