import { NextResponse } from "next/server";
import { isAuthorized } from "@/lib/isAuthorized";
import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const user = await isAuthorized();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const sources = await db.select().from(knowledge_source).where(eq(knowledge_source.user_email, user.email));
        

        // TODO: Fetch from database when knowledge sources table is created
        // For now, return empty array to fix the 405 error
        return NextResponse.json(
            { sources },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching knowledge sources:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}