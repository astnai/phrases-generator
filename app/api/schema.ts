import { z } from "zod";

export const quoteSchema = z.object({
  quotes: z
    .array(
      z.object({
        author: z
          .string()
          .min(2, "Author name must be at least 2 characters")
          .max(100, "Author name must not exceed 100 characters")
          .describe("Name of a tech entrepreneur"),
        quote: z
          .string()
          .min(10, "Quote must be at least 10 characters")
          .max(280, "Quote must not exceed 280 characters")
          .describe("Inspirational quote"),
      })
    )
    .min(1, "There must be at least one quote"),
});

export const languageSchema = z.enum(["en", "es"]);

export const requestSchema = z.object({
  quoteCount: z.number().int().min(1).max(10),
  apiKey: z.string().min(1, "API Key is required"),
  language: languageSchema,
});

export type Quote = z.infer<typeof quoteSchema>["quotes"][number];
export type PartialQuote = Partial<Quote>;
export type Language = z.infer<typeof languageSchema>;
export type RequestBody = z.infer<typeof requestSchema>;
