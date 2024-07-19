"use client";

import { useState, useCallback } from "react";
import { Quote } from "./api/schema";

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [quoteCount, setQuoteCount] = useState(2);
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!apiKey.trim()) {
      setError(
        language === "es"
          ? "Por favor, ingresa tu clave API de OpenAI"
          : "Please enter your OpenAI API key"
      );
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quoteCount, apiKey, language }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      setQuotes(data.quotes);
    } catch (error) {
      console.error("Error:", error);
      setError(
        language === "es"
          ? "No se pudieron generar las frases. Por favor, intenta de nuevo."
          : "Unable to generate quotes. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, quoteCount, language]);

  const toggleLanguage = (newLanguage: "en" | "es") => {
    setLanguage(newLanguage);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500 text-lg">
      <header className="p-4 flex justify-center items-center">
        <div className="language-toggle w-full max-w-xl">
          <button
            onClick={() => toggleLanguage("es")}
            className={`mr-1 ${
              language === "es" ? "font-semibold" : "text-gray-500"
            }`}
          >
            es
          </button>
          <span className="text-gray-500">|</span>
          <button
            onClick={() => toggleLanguage("en")}
            className={`ml-1 ${
              language === "en" ? "font-semibold" : "text-gray-500"
            }`}
          >
            en
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <h1 className="text-4xl font-bold mb-8">
          {language === "es" ? "Generador de frases" : "Quote Generator"} / ▲
          hackathon
        </h1>

        <div className="w-full max-w-xl space-y-8">
          <input
            type="password"
            placeholder={
              language === "es"
                ? "Ingresa su API key de OpenAI"
                : "Enter your OpenAI API key"
            }
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            aria-label={
              language === "es" ? "Clave API de OpenAI" : "OpenAI API Key"
            }
            className="w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 outline-none transition-colors duration-500"
          />

          <div className="flex items-center justify-center space-x-4">
            <label htmlFor="quoteCount" className="sr-only">
              {language === "es" ? "Número de frases" : "Number of quotes"}
            </label>
            <select
              id="quoteCount"
              value={quoteCount}
              onChange={(e) => setQuoteCount(parseInt(e.target.value))}
              className="px-2 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 outline-none transition-colors duration-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num}{" "}
                  {language === "es"
                    ? num === 1
                      ? "frase"
                      : "frases"
                    : num === 1
                    ? "quote"
                    : "quotes"}
                </option>
              ))}
            </select>
            <button
              className="px-6 py-2 text-lg font-semibold text-white bg-black rounded-full shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed outline-none dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors duration-500"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading
                ? language === "es"
                  ? "Generando..."
                  : "Generating..."
                : language === "es"
                ? "Generar"
                : "Generate"}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          <div className="space-y-6">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="p-8 md:p-12 bg-white border border-gray-200 rounded-full shadow-sm dark:bg-[#1C1C1C] dark:border-white overflow-hidden transition-all duration-500 transform translate-y-4 opacity-0 animation-delay-500"
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
      </main>
      <a
        href="https://github.com/astnai/phrases-generator"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:underline transition-colors duration-300"
      >
        Source
      </a>
    </div>
  );
}
