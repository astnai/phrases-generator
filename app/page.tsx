"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Quote, Language } from "./api/schema";

const QuoteCard: React.FC<{ quote: Quote }> = ({ quote }) => (
  <div className="p-8 md:p-12 bg-white border border-gray-200 rounded-3xl shadow-sm dark:bg-[#1C1C1C] dark:border-gray-700 overflow-hidden transition-all duration-500 transform hover:scale-105">
    <p className="mb-4 text-lg italic text-gray-700 dark:text-gray-300 break-words">
      "{quote.quote}"
    </p>
    <p className="text-right font-medium text-gray-900 dark:text-gray-100">
      - {quote.author}
    </p>
  </div>
);

const LanguageToggle: React.FC<{
  language: Language;
  toggleLanguage: (lang: Language) => void;
}> = ({ language, toggleLanguage }) => (
  <div className="language-toggle w-full max-w-xl flex justify-end space-x-2">
    {["es", "en"].map((lang) => (
      <button
        key={lang}
        onClick={() => toggleLanguage(lang as Language)}
        className={`px-2 py-1 rounded ${
          language === lang
            ? "bg-gray-200 dark:bg-gray-700 font-semibold"
            : "text-gray-500"
        }`}
      >
        {lang.toUpperCase()}
      </button>
    ))}
  </div>
);

export default function Page() {
  const [apiKey, setApiKey] = useState("");
  const [quoteCount, setQuoteCount] = useState(2);
  const [language, setLanguage] = useState<Language>("en");
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

  const toggleLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage);
  }, []);

  useEffect(() => {
    setQuotes([]);
  }, [language]);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500 text-lg">
      <header className="p-4 flex justify-center items-center">
        <LanguageToggle language={language} toggleLanguage={toggleLanguage} />
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
            className="w-full px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 outline-none transition-colors duration-500 focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
          />

          <div className="flex items-center justify-center space-x-4">
            <label htmlFor="quoteCount" className="sr-only">
              {language === "es" ? "Número de frases" : "Number of quotes"}
            </label>
            <select
              id="quoteCount"
              value={quoteCount}
              onChange={(e) => setQuoteCount(parseInt(e.target.value))}
              className="px-4 py-2 text-lg bg-white border border-gray-300 rounded-full shadow-sm dark:bg-black dark:text-white dark:border-gray-700 outline-none transition-colors duration-500 focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
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
              className="px-6 py-2 text-lg font-semibold text-white bg-black rounded-full shadow-sm transition-all hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed outline-none dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
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
              <QuoteCard key={index} quote={quote} />
            ))}
          </div>
        </div>
      </main>
      <footer className="p-4 text-center">
        <a
          href="https://github.com/astnai/phrases-generator"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:underline transition-colors duration-300"
        >
          {language === "es" ? "Código fuente" : "Source Code"}
        </a>
      </footer>
    </div>
  );
}
