import { z } from "zod";

export const quoteSchema = z.object({
  quotes: z
    .array(
      z.object({
        author: z
          .string()
          .min(2, "El nombre del autor debe tener al menos 2 caracteres")
          .max(100, "El nombre del autor no debe exceder los 100 caracteres")
          .describe("Name of a Silicon Valley entrepreneur"),
        quote: z
          .string()
          .min(10, "La cita debe tener al menos 10 caracteres")
          .max(280, "La cita no debe exceder los 280 caracteres")
          .refine(
            (quote) => !quote.includes("http"),
            "La cita no debe contener URLs"
          )
          .describe("Inspirational quote. Do not use emojis or links."),
      })
    )
    .min(1, "Debe haber al menos una cita"),
});

export type Quote = z.infer<typeof quoteSchema>["quotes"][number];

export type PartialQuote = Partial<Quote>;
