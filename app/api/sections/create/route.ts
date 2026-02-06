import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/isAuthorized";
import { db } from "@/db/client";
import { sections } from "@/db/schema";


export async function POST(request: NextRequest) {
    try{
            const user = await isAuthorized();
        if(!user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const body = await request.json();

            const { name, description, tone, allowedTopics, blockedTopics, sourceIDs } = body;
            if(!name || !description || !tone ){
                return NextResponse.json({error: "Missing required fields"}, {status: 400});
            }
            if(!sourceIDs || !Array.isArray(sourceIDs) || sourceIDs.length === 0){
                return NextResponse.json({error: "At least one knowledge source is required"}, {status: 400});
            }
            const section = await db.insert(sections).values({
                user_email: user.email,
                name,
                description,
                source_ids: sourceIDs,
                tone,
                allowed_topics: allowedTopics || null,
                blocked_topics: blockedTopics || null,
                status: "active",
            });
            return NextResponse.json({message: "Section created successfully"}, {status: 201});

    }catch(error){
        console.error("Error creating section:", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
}
