import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { quoteSchema, requestSchema, Quote } from "./schema";
import { ZodError } from "zod";

export const maxDuration = 30;

const cache = new Map<string, { quotes: Quote[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { quoteCount, apiKey, language } = requestSchema.parse(body);

    const cacheKey = `${quoteCount}-${language}`;
    const cachedResult = cache.get(cacheKey);

    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return new Response(JSON.stringify({ quotes: cachedResult.quotes }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = createOpenAI({
      apiKey,
      compatibility: "strict",
    });

    const model = openai("gpt-4-turbo");

    const systemPrompt =
      language === "es"
        ? "Eres un asistente que genera citas inspiradoras de emprendedores de Silicon Valley en español. Las citas deben ser únicas, relevantes y atribuidas a emprendedores reales. Asegúrate de incluir una amplia variedad de emprendedores, no solo los más famosos. Evita repetir autores a menos que sea absolutamente necesario. Incluye emprendedores de diversas áreas tecnológicas y orígenes."
        : "You are an assistant that generates inspirational quotes from Silicon Valley entrepreneurs in English. The quotes should be unique, relevant, and attributed to real entrepreneurs. Make sure to include a wide variety of entrepreneurs, not just the most famous ones. Avoid repeating authors unless absolutely necessary. Include entrepreneurs from diverse tech areas and backgrounds.";

    const userPrompt =
      language === "es"
        ? `Genera exactamente ${quoteCount} citas inspiracionales de emprendedores de Silicon Valley. Cada cita debe ser única y atribuida a un emprendedor diferente. Asegúrate de incluir una mezcla diversa de emprendedores, incluyendo algunos menos conocidos y de diferentes orígenes étnicos y géneros. No uses a Steve Jobs o Elon Musk a menos que se soliciten más de 5 citas. Formatea la respuesta como un objeto JSON con un array 'quotes' que contenga objetos con los campos 'author' y 'quote'.`
        : `Generate exactly ${quoteCount} inspirational quotes from Silicon Valley entrepreneurs. Each quote should be unique and attributed to a different entrepreneur. Make sure to include a diverse mix of entrepreneurs, including some lesser-known ones and from different ethnic backgrounds and genders. Don't use Steve Jobs or Elon Musk unless more than 5 quotes are requested. Format the response as a JSON object with a 'quotes' array containing objects with 'author' and 'quote' fields.`;

    const { text } = await generateText({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
    });

    if (!text) {
      throw new Error(
        language === "es"
          ? "No se generó contenido"
          : "No content was generated"
      );
    }

    const parsedContent = JSON.parse(text);
    const validatedQuotes = quoteSchema.parse(parsedContent);

    cache.set(cacheKey, {
      quotes: validatedQuotes.quotes,
      timestamp: Date.now(),
    });

    return new Response(JSON.stringify(validatedQuotes), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    if (error instanceof ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        error: "Unable to generate quotes. Please try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
