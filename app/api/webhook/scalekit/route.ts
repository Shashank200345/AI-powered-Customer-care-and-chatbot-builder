import { db } from "@/db/client";
import { teamMembers } from "@/db/schema";
import scalekit from "@/lib/scalekit";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
        // Must use raw body string for signature verification (ScaleKit signs the exact bytes)
        const rawBody = await req.text();
        const headers = Object.fromEntries(req.headers.entries());
        const secret = process.env.SCALEKIT_WEBHOOK_SECRET!;

        try {
            scalekit.verifyWebhookPayload(secret, headers, rawBody);
        } catch (error) {
            console.log("Webhook verification failed:", error);
            return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
        }

        const event = JSON.parse(rawBody);

        switch (event.type) {
            case "user.organization_membership_created": {
                const data = event.data || {};

                // Try multiple possible locations for the user email,
                // since the exact webhook payload shape can vary.
                const email =
                    data.user_email ||
                    data.email ||
                    data.user?.email ||
                    data.membership?.user?.email ||
                    null;

                if (!email) {
                    console.log(
                        "Scalekit webhook: organization_membership_created received without resolvable email",
                        { data },
                    );
                    break;
                }

                const result = await db
                    .update(teamMembers)
                    .set({ status: "active" })
                    .where(eq(teamMembers.user_email, email));

                console.log("Scalekit webhook: updated team member status to active", {
                    email,
                    result,
                });
                break;
            }

            default: {
                console.log("Unhandled Scalekit webhook event type:", event.type);
                break;
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    }
     catch (error) {
        console.log("Webhook processing error:", error);
        return NextResponse.json({error: "Failed to process webhook"}, {status: 500});
        
    }
}