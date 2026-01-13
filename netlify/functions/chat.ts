import { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    const API_KEY = process.env.OPENROUTER_API_KEY;
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "API Key not configured on server" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    try {
        const body = await req.json();

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://brief-weaver.netlify.app",
                "X-Title": "Brief Weaver",
            },
            body: JSON.stringify(body),
        });

        // Handle streaming if requested
        if (body.stream) {
            return new Response(response.body, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Internal Server Error", details: String(error) }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
