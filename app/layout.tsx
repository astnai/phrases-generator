import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
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
      <head>
        {Object.entries(metadata).map(([name, content]) => (
          <meta key={name} name={name} content={content} />
        ))}
      </head>
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-500`}
      >
        {children}
      </body>
    </html>
  );
}
