import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { chatBotMetadata, sections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";


export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    if(!token) {
        return NextResponse.json({error: "Token is required"}, {status: 400});
    }
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

        const {payload} = await jwtVerify(token, secret);

        const widgetId = payload.widgetId as string;
        const ownerEmail = payload.ownwerEmail as string;

        const [meta] = await db.select().from(chatBotMetadata).where(eq(chatBotMetadata.id, widgetId)).limit(1);

        if(!meta) {
            return NextResponse.json({error: "Bot not found"}, {status: 404});
        }

        const userSections = await db.select().from(sections).where(eq(sections.user_email, ownerEmail)); 
        return NextResponse.json({
            metadata: meta,
            sections: userSections,
        })
    } catch (error) {
        
        console.error("Widget Config Error:", error);
        return NextResponse.json({error: "Invalid"}, {status: 500});
    }
}