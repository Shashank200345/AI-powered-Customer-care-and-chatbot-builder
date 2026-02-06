import { GoogleGenerativeAI } from "@google/generative-ai";
import https from "https";


// Initialize Gemini AI (similar to OpenAI instance)
export const gemini = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY!
);

export type SummarizeOptions = {
    /** Full URL; if it has a fragment (e.g. #pricing), emphasize that section in the output */
    sourceUrl?: string;
};

export async function summarizeMarkdown(markdown: string, options?: SummarizeOptions) {
    try {
        let hasFragment = false;
        try {
            hasFragment = Boolean(options?.sourceUrl && new URL(options.sourceUrl).hash?.trim());
        } catch {
            // ignore invalid URL
        }
        const model = gemini.getGenerativeModel({
            model: "gemini-3-flash-preview",
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: hasFragment ? 3500 : 2000,
            }
        });

        const fragmentHint = (() => {
            if (!options?.sourceUrl) return "";
            try {
                const u = new URL(options.sourceUrl);
                const hash = (u.hash || "").replace(/^#/, "").trim();
                if (!hash) return "";
                const label = hash.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                const isPricing = /pricing|price|plan|plans|tier|tiers/.test(hash.toLowerCase());
                if (isPricing) {
                    return `

CRITICAL - Pricing section: The user requested the "${label}" section (URL #${hash}). Your output MUST include the FULL pricing/plans content: every plan name (e.g. Free, Pro, Basic), every price (e.g. $X/month, free forever), and every feature list or bullet point under each plan. Do NOT summarize or omit any prices, plan names, or feature lists. You may briefly summarize other parts of the page, but the pricing/plans section must be complete and verbatim enough to answer "how much does X cost?" and "what's included in plan Y?".`;
                }
                return `

IMPORTANT - Section focus: The user requested content from the section "${label}" (URL fragment #${hash}). Preserve and emphasize ALL content for that section. You may summarize or condense other parts of the page, but the "${label}" section must be complete and detailed enough to answer customer questions about it.`;
            } catch {
                return "";
            }
        })();

        const systemPrompt = `
You are a data summarization engine for an AI chatbot.

Your task:

- Convert the input website markdown or text or csv files data into a COMPREHENSIVE, DETAILED SUMMARY for LLM context usage.
${fragmentHint}

STRICT RULES:

- Output ONLY plain text (no markdown, no bullet points, no headings).
- Write as ONE continuous paragraph.
- Remove navigation, menus, buttons, sponsor blocks, ads, community chat widgets, UI labels, emojis, and decorative content. Do NOT remove pricing, plans, tiers, or product/pricing details — KEEP all pricing information, plan names, prices, and feature lists.
- If the input contains a pricing or plans section (e.g. Free, Pro, plan names, dollar amounts, "per month"), include that section in full with every plan name, price, and feature list — do not summarize it away.
- Remove repetition and marketing fluff, but keep all factual and informational content.
- Keep ALL factual, informational content that helps answer customer support questions (including pricing, plans, features, limits, FAQs).
- Preserve important details, features, instructions, processes, and key information.
- Include relevant context, explanations, and examples when available.
- Be comprehensive and detailed - aim for 1500-2000 words to capture all important information.
- Do NOT copy sentences verbatim unless absolutely necessary, but preserve the meaning and details.
- Organize information logically and coherently.
- The final output should be comprehensive enough to answer detailed customer questions.

The result will be stored as long-term context for a chatbot that needs to answer detailed questions.
`;

        const prompt = `${systemPrompt}\n\nInput data to summarize:\n\n${markdown}`;

        // Generate content (similar to OpenAI's chat.completions.create)
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text.trim() ?? "";
    } catch (error) {
        console.error("Error in summarization:", error);
        throw error;
    }
}
