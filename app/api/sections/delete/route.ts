import { isAuthorized } from "@/lib/isAuthorized";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { sections } from "@/db/schema";

import { and, eq } from "drizzle-orm";

export async function DELETE(request: NextRequest){
    try {
        const user = await isAuthorized();
        if(!user){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const { id } = await request.json();
        if(!id){
            return NextResponse.json({error: "Section ID is required"}, {status: 400});
        }
        
        const [section] = await db
            .select()
            .from(sections)
            .where(and(eq(sections.user_email, user.email), eq(sections.id, id)));

        if(!section){
            return NextResponse.json({error: "You can't delete this section"}, {status: 404});
        }

        await db
            .delete(sections)
            .where(and(eq(sections.user_email, user.email), eq(sections.id, id)));
        return NextResponse.json({message: "Section deleted successfully"}, {status: 200});
    } catch (error) {
        console.error("Error deleting section:", error);
        return NextResponse.json({error: "Failed to delete section"}, {status: 500});
    }
}
