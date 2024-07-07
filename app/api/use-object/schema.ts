import { z } from "zod";

export const quoteSchema = z.object({
  quotes: z.array(
    z.object({
      author: z.string().describe("Name of a Silicon Valley entrepreneur"),
      quote: z
        .string()
        .describe("Inspirational quote. Do not use emojis or links."),
    })
  ),
});

export type Quote = z.infer<typeof quoteSchema>["quotes"][number];

export type PartialQuote = Partial<Quote>;
