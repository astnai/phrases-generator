import "./globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Quote Generator",
  description:
    "Generate inspirational quotes from Silicon Valley entrepreneurs using AI.",
  keywords: "quotes, AI, Silicon Valley, entrepreneurs, inspiration, OpenAI",
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500`}
      >
        {children}
      </body>
    </html>
  );
}
