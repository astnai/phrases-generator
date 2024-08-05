import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { quoteSchema, requestSchema, Quote, Language } from "./schema";
import { ZodError } from "zod";

export const maxDuration = 30;

const cache = new Map<string, { quotes: Quote[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const getSystemPrompt = (language: Language): string => `
You are an AI assistant specialized in generating inspirational and thought-provoking quotes from Silicon Valley entrepreneurs. Your task is to create unique, relevant, and attributed quotes that capture the essence of innovation, leadership, and entrepreneurship.

Guidelines:
1. Generate quotes in ${language === "es" ? "Spanish" : "English"}.
2. Ensure each quote is unique and attributed to a different entrepreneur.
3. Include a diverse range of entrepreneurs, considering gender, ethnicity, and areas of expertise.
4. Focus on lesser-known entrepreneurs as well as established figures.
5. Avoid using Steve Jobs or Elon Musk unless more than 5 quotes are requested.
6. Quotes should be concise, impactful, and relevant to technology, innovation, or business.
7. Ensure the language and tone are appropriate for the attributed entrepreneur.
8. Do not use emojis or special characters in the quotes or author names.
9. Do not include URLs or links in the quotes.

Example of a good quote:
"Innovation is not about saying yes to everything. It's about saying no to all but the most crucial features." - Steve Jobs

Example of a diverse attribution:
"Build something 100 people love, not something 1 million people kind of like." - Brian Chesky (Airbnb co-founder)

Remember to vary the style, length, and focus of the quotes to maintain interest and diversity.
`;

const getUserPrompt = (quoteCount: number, language: Language): string => `
Generate exactly ${quoteCount} inspirational quote${
  quoteCount > 1 ? "s" : ""
} from Silicon Valley entrepreneurs, following these criteria:

1. Each quote must be unique and attributed to a different entrepreneur.
2. Include a diverse mix of entrepreneurs, considering gender, ethnicity, and areas of expertise.
3. At least 50% of the quotes should be from lesser-known entrepreneurs.
4. Quotes should be in ${language === "es" ? "Spanish" : "English"}.
5. Each quote should be between 10 and 100 words long.
6. Focus on themes of innovation, leadership, perseverance, or vision in technology and business.
7. Avoid clichés and overly generic statements.
8. Do not use emojis or special characters in the quotes or author names.
9. Do not include URLs or links in the quotes.

Format the response as a JSON object with a 'quotes' array containing objects with 'author' and 'quote' fields. Example:

{
  "quotes": [
    {
      "author": "Sheryl Sandberg",
      "quote": "Done is better than perfect."
    },
    {
      "author": "Reid Hoffman",
      "quote": "If you are not embarrassed by the first version of your product, you've launched too late."
    }
  ]
}

Ensure that the JSON is valid and properly formatted.
`;

const verifyQuotes = (quotes: Quote[], quoteCount: number): boolean => {
  const authors = new Set<string>();

  for (const quote of quotes) {
    if (authors.has(quote.author)) return false; // Duplicate author
    authors.add(quote.author);

    if (quote.quote.length < 10 || quote.quote.length > 280) return false; // Quote length check
  }

  return quotes.length === quoteCount;
};

export async function POST(req: Request): Promise<Response> {
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

    let validQuotes: Quote[] = [];
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && validQuotes.length === 0) {
      const { text } = await generateText({
        model,
        messages: [
          { role: "system", content: getSystemPrompt(language) },
          { role: "user", content: getUserPrompt(quoteCount, language) },
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

      try {
        const parsedContent = JSON.parse(text);
        const validatedQuotes = quoteSchema.parse(parsedContent);

        if (verifyQuotes(validatedQuotes.quotes, quoteCount)) {
          validQuotes = validatedQuotes.quotes;
        }
      } catch (error) {
        console.error("Error parsing or validating quotes:", error);
      }

      attempts++;
    }

    if (validQuotes.length === 0) {
      throw new Error(
        language === "es"
          ? "No se pudieron generar citas válidas después de varios intentos"
          : "Unable to generate valid quotes after multiple attempts"
      );
    }

    cache.set(cacheKey, {
      quotes: validQuotes,
      timestamp: Date.now(),
    });

    return new Response(JSON.stringify({ quotes: validQuotes }), {
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
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
