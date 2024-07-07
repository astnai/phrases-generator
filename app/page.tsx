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
      setError("Please enter your OpenAI API Key");
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
        throw new Error("Failed to generate quotes");
      }
      const data = await response.json();
      const validatedData = quoteSchema.parse(data);
      setQuotes(validatedData.quotes);
    } catch (error) {
      console.error("Error:", error);
      setError("Failed to generate quotes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-black text-black dark:text-white">
      <div className="w-full max-w-xl space-y-6">
        <input
          type="password"
          placeholder="Enter your OpenAI API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />

        <div className="flex items-center justify-center space-x-4">
          <select
            value={quoteCount}
            onChange={(e) => setQuoteCount(parseInt(e.target.value))}
            className="px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          <button
            className="px-6 py-2 text-lg font-semibold text-white bg-black rounded-full shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Quotes"}
          </button>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="space-y-6">
          {quotes.map((quote, index) => (
            <div
              key={index}
              className="p-6 bg-white border border-gray-200 rounded-full shadow-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <p className="mb-4 text-lg italic text-gray-700 dark:text-gray-300">
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
