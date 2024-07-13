import OpenAI from "openai";
import { quoteSchema } from "./schema";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { quoteCount, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = new OpenAI({ apiKey });

    const safeQuoteCount = Math.max(1, Math.min(10, quoteCount));

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates inspirational quotes from Silicon Valley entrepreneurs.",
        },
        {
          role: "user",
          content: `Generate exactly ${safeQuoteCount} inspirational quotes from Silicon Valley entrepreneurs. Each quote should be unique and attributed to a different entrepreneur. Format the response as a JSON object with a 'quotes' array containing objects with 'author' and 'quote' fields.`,
        },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated");
    }

    const parsedContent = JSON.parse(content);
    const validatedQuotes = quoteSchema.parse(parsedContent);

    return new Response(JSON.stringify(validatedQuotes), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate quotes" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
