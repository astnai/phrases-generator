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
      compatibility: "strict",
    });

    const model = openai("gpt-4-turbo");

    const safeQuoteCount = Math.max(1, Math.min(10, quoteCount));

    const { text } = await generateText({
      model,
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que genera citas inspiradoras de emprendedores de Silicon Valley en español. Las citas deben ser únicas, relevantes y atribuidas a emprendedores reales. Asegúrate de incluir una amplia variedad de emprendedores, no solo los más famosos. Evita repetir autores a menos que sea absolutamente necesario.",
        },
        {
          role: "user",
          content: `Genera exactamente ${safeQuoteCount} citas inspiracionales de emprendedores de Silicon Valley. Cada cita debe ser única y atribuida a un emprendedor diferente. Asegúrate de incluir una mezcla diversa de emprendedores, incluyendo algunos menos conocidos. No uses a Steve Jobs o Elon Musk a menos que se soliciten más de 5 citas. Formatea la respuesta como un objeto JSON con un array 'quotes' que contenga objetos con los campos 'author' y 'quote'.`,
        },
      ],
      temperature: 1,
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
      JSON.stringify({
        error: "No se pudieron generar las citas. Por favor, intenta de nuevo.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
