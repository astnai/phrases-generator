import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
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

    const openai = createOpenAI({
      apiKey,
      compatibility: "strict", // Ensure strict compatibility with OpenAI API
    });

    const model = openai("gpt-4");

    const safeQuoteCount = Math.max(1, Math.min(10, quoteCount));

    const { text } = await generateText({
      model,
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente útil que genera citas inspiradoras de emprendedores de Silicon Valley en español.",
        },
        {
          role: "user",
          content: `Genera exactamente ${safeQuoteCount} citas inspiracionales de emprendedores de Silicon Valley. Cada cita debe ser única y atribuida a un emprendedor diferente. Formatea la respuesta como un objeto JSON con un array 'quotes' que contenga objetos con los campos 'author' y 'quote'.`,
        },
      ],
      temperature: 0.8,
    });

    if (!text) {
      throw new Error("No se generó contenido");
    }

    const parsedContent = JSON.parse(text);
    const validatedQuotes = quoteSchema.parse(parsedContent);

    return new Response(JSON.stringify(validatedQuotes), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "No se pudieron generar las citas" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
