"use client";

import { useState } from "react";
import { quoteSchema, Quote } from "./api/use-object/schema";

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [quoteCount, setQuoteCount] = useState(3);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      setError("please enter your openai api key");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/use-object", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quoteCount, apiKey }),
      });
      if (!response.ok) {
        throw new Error("failed to generate quotes");
      }
      const data = await response.json();
      const validatedData = quoteSchema.parse(data);
      setQuotes(validatedData.quotes);
    } catch (error) {
      console.error("error:", error);
      setError("failed to generate quotes. please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      <div className="w-full max-w-xl space-y-6">
        <input
          type="password"
          placeholder="enter your openai api key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-500"
        />

        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4">
          <select
            value={quoteCount}
            onChange={(e) => setQuoteCount(parseInt(e.target.value))}
            className="px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <button
            className="px-6 py-2 text-lg font-semibold text-white bg-black rounded-full shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-500"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "generating..." : "generate quotes"}
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-6">
          {quotes.map((quote, index) => (
            <div
              key={index}
              className="p-8 md:p-12 bg-white border border-gray-200 rounded-full shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden transition-all duration-500 transform translate-y-4 opacity-0 animation-delay-500"
            >
              <p className="mb-4 text-lg italic text-gray-700 dark:text-gray-300 break-words">
                "{quote.quote}"
              </p>
              <p className="text-right font-medium text-gray-900 dark:text-gray-100">
                - {quote.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
