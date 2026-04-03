import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log('BACKEND MESSAGES:', JSON.stringify(messages, null, 2));

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: "You are an expert career AI assistant. You help the user generate career roadmaps, suggest skills/projects/jobs, review resumes, improve ATS scores, and prepare for interviews.",
    messages,
  });

  return result.toUIMessageStreamResponse();
}




//

