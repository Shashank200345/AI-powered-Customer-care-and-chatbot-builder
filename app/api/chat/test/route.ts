import { db } from "@/db/client";
import { knowledge_source, sections } from "@/db/schema";
import { buildRagPrompt, type ChatMessage } from "@/lib/buildRagPrompt";
import { countConversationTokens } from "@/lib/countConversationToken";
import { gemini } from "@/lib/geminiAI";
import { isAuthorized } from "@/lib/isAuthorized";
import { pickSectionForQuestion } from "@/lib/pickSectionForQuestion";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const user = await isAuthorized();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = (user as { email?: string }).email;
    if (!userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, knowledge_source_ids, section_id } = body as {
      messages?: ChatMessage[];
      knowledge_source_ids?: string[];
      section_id?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    let sourceIds: string[] = [];
    let sectionUsed: string | null = null;

    if (
      knowledge_source_ids &&
      Array.isArray(knowledge_source_ids) &&
      knowledge_source_ids.length > 0
    ) {
      sourceIds = knowledge_source_ids;
    } else {
      const userSections = await db
        .select({
          id: sections.id,
          name: sections.name,
          source_ids: sections.source_ids,
        })
        .from(sections)
        .where(eq(sections.user_email, userEmail));

      const lastUserMessage =
        [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
      const chosenSectionId = pickSectionForQuestion(
        lastUserMessage,
        userSections,
        section_id ?? null
      );

      if (chosenSectionId) {
        const section = userSections.find((s) => s.id === chosenSectionId);
        if (section?.source_ids?.length) {
          sourceIds = section.source_ids;
          sectionUsed = section.name;
        }
      }
    }

    let context = "";
    if (sourceIds.length > 0) {
      const sources = await db
        .select({ content: knowledge_source.content })
        .from(knowledge_source)
        .where(inArray(knowledge_source.id, sourceIds));

      context = sources
        .map((s) => s.content)
        .filter(Boolean)
        .join("\n\n");
    }

    const prompt = buildRagPrompt(messages, context);

    const model = gemini.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    if (!answer) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 502 }
      );
    }

    const tokenCount = countConversationTokens(messages);

    return NextResponse.json({
      answer: answer.trim(),
      contextUsed: context.length > 0,
      tokenCount,
      sectionUsed: sectionUsed ?? undefined,
    });
  } catch (error) {
    console.error("RAG chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
