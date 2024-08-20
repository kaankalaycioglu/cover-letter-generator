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

        const messageContent = completion.choices[0]?.message?.content || "";
        console.log("Generated cover letter:", messageContent);

        return NextResponse.json({
            result: messageContent,
        });
    } catch (error: any) {
        if (error instanceof Groq.APIError) {
            console.log(error.status); // 400
            console.log(error.name); // BadRequestError
            console.log(error.headers); // {server: 'nginx', ...}
        } else {
            console.error("Error generating cover letter:", error);
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
