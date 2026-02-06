import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/isAuthorized";
import { summarizeMarkdown } from "@/lib/geminiAI";
import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";


export async function POST(req:NextRequest) {
    try{
        const user = await isAuthorized();
        if(!user) {
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const contentType = req.headers.get("content-type") || "";
        let type: string;
        let body: any = {};

        if(contentType.includes("multipart/form-data")){
            const formData = await req.formData();
            type = formData.get("type") as string;

            if(type === "upload") {
                const file = formData.get("file") as File;

                if(!file){
                    return NextResponse.json(
                        {error: "No file provided"},
                        {status:400}
                    );
                }

                const fileContent = await file.text();
                const lines = fileContent.split("\n").filter((line) => line.trim());
                const headers = lines[0].split(",").map((h) => h.trim());
                let formattedContent: any = "";

                const markdown = await summarizeMarkdown(fileContent);
                formattedContent = markdown;

                await db.insert(knowledge_source).values({
                    user_email: user.email,
                    type: "docs",
                    name: file.name, // Use file name instead of body.name
                    status: "active",
                    content: formattedContent,
                    meta_data: JSON.stringify({
                        fileName: file.name,
                        fileSize: file.size,
                        rowCount: lines.length - 1,
                        headers: headers,
                    }),
                });
                return NextResponse.json(
                    {message: "CSV file uploaded successfully"},
                    {status: 200}
                )
            }
        } else {
            body = await req.json();
            type = body.type;
        }

        if(type === "website"){
            if (!body?.url?.trim()) {
                return NextResponse.json(
                    { error: "URL is required for website source." },
                    { status: 400 }
                );
            }
            const zenrowsKey = process.env.ZENROWS_API_KEY;
            if (!zenrowsKey) {
                return NextResponse.json(
                    { error: "Scraping service is not configured. Please set ZENROWS_API_KEY." },
                    { status: 503 }
                );
            }
            const zenUrl = new URL("https://api.zenrows.com/v1/");
            zenUrl.searchParams.set("apikey", zenrowsKey);
            zenUrl.searchParams.set("url", body.url.trim());
            zenUrl.searchParams.set("response_type", "markdown");

            const res = await fetch(zenUrl.toString(), {
                headers: {
                    "User-Agent": "OneMinuteSupportBot/1.0",
                }
            });

            const html = await res.text();

            if (!res.ok) {
                return NextResponse.json(
                    {
                        error: "Zenrows request failed",
                        status: res.status,
                        body: html.slice(0, 500),
                    },
                    { status: 502 }
                );
            }

            const markdown = await summarizeMarkdown(html, {
                sourceUrl: body.url,
            });

            // Generate name from URL (extract domain name)
            let name = body.name;
            if(!name && body.url) {
                try {
                    const urlObj = new URL(body.url);
                    name = urlObj.hostname.replace('www.', ''); // Remove www. prefix
                } catch {
                    name = body.url; // Fallback to full URL if parsing fails
                }
            }

            await db.insert(knowledge_source).values({
                user_email: user.email,
                type: "website",
                name: name || "Website Source", // Fallback if name is still null
                status: "active",
                source_url: body.url,
                content: markdown,
            });
        } else if(type === "text"){
            let content = body.content;
            if(content.length > 500){
                const markdown = await summarizeMarkdown(body.content);
                content = markdown;
            }
            await db.insert(knowledge_source).values({
                user_email: user.email,
                type: "text",
                name: body.title,
                status: "active",
                content: content,
            });
           
        }

        return NextResponse.json(
            {message: "Source stored successfully"},
            {status: 200}
        );

    }catch(error){
        console.error("Error in knnowledge store:", error);
        return NextResponse.json(
            {error: "Internal Server Error"},
            {status: 500}
        );
    }

}
