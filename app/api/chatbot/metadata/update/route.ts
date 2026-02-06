import { db } from "@/db/client";
import { chatBotMetadata } from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";



export async function PUT(request: Request) {
    try {
        const user = await isAuthorized();
        if(!user){
            return NextResponse.json({error:"Unauthorized"}, {status: 401});
        }

        const body = await request.json();
        const color = body.color;
        const welcomeMessage = body.welcome_message ?? body.welcome_messages;

        if (!color || welcomeMessage == null || welcomeMessage === "") {
            return NextResponse.json(
                { error: "Missing required fields: color and welcome_message (or welcome_messages)" },
                { status: 400 }
            );
        }

        const [updatedMetadata] = await db.update(chatBotMetadata).set({
            color,
            welcome_messages: welcomeMessage,
        })
        .where(eq(chatBotMetadata.user_email, user.email!))
        .returning();

        return NextResponse.json(updatedMetadata, {status: 200});

    } catch (error) {
        console.error("Error updating chatbot metadata:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}