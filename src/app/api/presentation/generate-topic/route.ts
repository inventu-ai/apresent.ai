import { LangChainAdapter } from "ai";
import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

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

Generate a single topic that would fit well within the existing presentation structure. The topic should be based on the user's suggestion.
Format the response as markdown content, with the topic as a heading followed by 2-3 bullet points.

Example format:
# Topic Title That Matches User Suggestion
- Key point about this topic
- Another important aspect
- Brief conclusion or impact

Make sure the topic:
1. Addresses the user's suggestion directly
2. Fits well with the existing topics
3. Is clear and concise
4. Is engaging for the audience
5. ALWAYS use bullet points (not paragraphs) and format each point as "- point text"
6. Do not use bold, italic or underline
7. Keep each bullet point brief - just one sentence per point
8. Include exactly 2-3 bullet points (not more, not less)`;

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

Format the response as markdown content, with the topic as a heading followed by 2-3 bullet points.

Example format:
# Improved Topic Title
- Enhanced key point about this topic
- More detailed important aspect
- Stronger conclusion or impact

Make sure the improved topic:
1. Maintains the core theme of the original topic
2. Is more engaging and professional
3. Fits well with the existing topics
4. Is clear and concise
5. ALWAYS use bullet points (not paragraphs) and format each point as "- point text"
6. Do not use bold, italic or underline
7. Keep each bullet point brief - just one sentence per point
8. Include exactly 2-3 bullet points (not more, not less)`;

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

    return LangChainAdapter.toDataStreamResponse(stream);
  } catch (error) {
    console.error("Error in topic generation:", error);
    return NextResponse.json(
      { error: "Failed to generate topic" },
      { status: 500 },
    );
  }
}
