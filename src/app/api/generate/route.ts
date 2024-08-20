import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content:
                        "You are a helpful assistant that generates cover letters based on resumes and job descriptions.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.1-8b-instant",
        });

        console.log(completion.choices[0]?.message?.content);

        return NextResponse.json({
            result: completion.choices[0]?.message?.content || "",
        });
    } catch (error: any) {
        console.error("An error occurred:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
