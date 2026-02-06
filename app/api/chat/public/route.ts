import { db } from "@/db/client";
import { conversation, knowledge_source, messages as messagesTable, sections } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { buildRagPrompt, type ChatMessage } from "@/lib/buildRagPrompt";
import { countConversationTokens } from "@/lib/countConversationToken";
import { gemini } from "@/lib/geminiAI";
import { pickSectionForQuestion } from "@/lib/pickSectionForQuestion";

export async function POST(request: Request) {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if(!token) {
        return NextResponse.json({error: "No token provided"}, {status: 401});
    }

    let sessionId: string | undefined;
    let widgetId: string | undefined;
    let ownerEmail: string | undefined;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const {payload} = await jwtVerify(token, secret);
        sessionId = payload.sessionId as string;
        widgetId = payload.widgetId as string;
        ownerEmail = (payload.ownwerEmail as string) || (payload.ownerEmail as string);

        if(!sessionId || !widgetId) {
            throw new Error("Invalid token payload");
        }

    } catch (error) {
        console.error("Token Verification Failed:", error);
        return NextResponse.json(
            {error: "Invalid token"},
            {status: 401}
        );
    }

    let body: { messages?: ChatMessage[]; knowledge_source_ids?: string[]; section_id?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { messages: rawMessages, knowledge_source_ids: bodySourceIds, section_id: bodySectionId } = body;
    const messages = Array.isArray(rawMessages) ? rawMessages : [];

    if (messages.length === 0) {
        return NextResponse.json(
            { error: "messages array is required and must not be empty" },
            { status: 400 }
        );
    }

    const lastMessage = messages[messages.length - 1];
    if(!lastMessage || lastMessage.role !== 'user') {
        return NextResponse.json(
            { error: "Last message must be from user" },
            { status: 400 }
        );
    } 

    try {
        const [existingConv] = await db
        .select()
        .from(conversation)
        .where(eq(conversation.id, sessionId))
        .limit(1);

        if(!existingConv) {
            const forwardedFor = request.headers.get("x-forwarded-for");
            const ip = forwardedFor ? forwardedFor.split(',')[0] : "Unknown IP";
            const visitorName = `#Visitor(${ip})`;

            await db.insert(conversation).values({
                id: sessionId,
                chatbot_id: widgetId,
                visitor_ip: ip,
                name: visitorName,
            });

            const previousMessages = messages.slice(0, -1);
            if(previousMessages.length > 0) {
                for(const msg of previousMessages) {
                    await db.insert(messagesTable).values({
                        conversation_id: sessionId,
                        role: msg.role as "user" | "assistant",
                        content: msg.content,
                    })
                }
            }
        }
    if(lastMessage && lastMessage.role === 'user') {
        await db.insert(messagesTable).values({
            conversation_id: sessionId,
            role: "user",
            content: lastMessage.content,
        })
    }
    } catch (error) {
        console.error("Error processing message:", error);
        return NextResponse.json(
            {error: "Internal server error"},
            {status: 500}
        )
    }
    let sourceIds: string[] = [];

    if (bodySourceIds && bodySourceIds.length > 0) {
        sourceIds = bodySourceIds;
    } else if (ownerEmail) {
        const userSections = await db
            .select({ id: sections.id, name: sections.name, source_ids: sections.source_ids })
            .from(sections)
            .where(eq(sections.user_email, ownerEmail));

        if (bodySectionId) {
            const section = userSections.find((s) => s.id === bodySectionId);
            if (section?.source_ids?.length) sourceIds = section.source_ids;
        } else {
            const lastUserContent = lastMessage.content ?? "";
            const chosenSectionId = pickSectionForQuestion(
                lastUserContent,
                userSections,
                null
            );
            if (chosenSectionId) {
                const section = userSections.find((s) => s.id === chosenSectionId);
                if (section?.source_ids?.length) sourceIds = section.source_ids;
            }
        }
    }

    let context = "";
    if (sourceIds.length > 0) {
        try {
            const sources = await db
                .select({ content: knowledge_source.content })
                .from(knowledge_source)
                .where(inArray(knowledge_source.id, sourceIds));
            context = sources.map((s) => s.content).filter(Boolean).join("\n\n");
        } catch (error) {
            console.error("Error fetching knowledge sources:", error);
        }
    }

    const tokenCount = countConversationTokens(messages);
    const messagesForPrompt = tokenCount > 6000 ? messages.slice(-10) : messages;
    const prompt = buildRagPrompt(messagesForPrompt as ChatMessage[], context);

    const model = gemini.getGenerativeModel({
        model: "gemini-3-flash-preview",
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
        },
    });

    let answer: string;
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        answer = response.text()?.trim() ?? "";
    } catch (error) {
        console.error("Gemini public chat error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 502 }
        );
    }

    if (!answer) {
        return NextResponse.json(
            { error: "No response from model" },
            { status: 502 }
        );
    }

    try {
        await db.insert(messagesTable).values({
            conversation_id: sessionId,
            role: "assistant",
            content: answer,
        });
    } catch (error) {
        console.error("Error saving assistant message:", error);
    }

    return NextResponse.json({
        answer,
        contextUsed: context.length > 0,
        tokenCount,
    });
}