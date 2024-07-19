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
          .refine(
            (quote) => !quote.includes("http"),
            "Quote must not contain URLs"
          )
          .describe("Inspirational quote. Do not use emojis or links."),
      })
    )
    .min(1, "There must be at least one quote"),
});

export type Quote = z.infer<typeof quoteSchema>["quotes"][number];

export type PartialQuote = Partial<Quote>;

export const languageSchema = z.enum(["en", "es"]);

export type Language = z.infer<typeof languageSchema>;
