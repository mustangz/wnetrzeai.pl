import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WnetrzeAI — AI Virtual Staging dla Agentów Nieruchomości",
  description:
    "Puste mieszkanie urządzone w 30 sekund. AI dodaje meble i dekoracje do zdjęć nieruchomości. 40% więcej zapytań, szybsza sprzedaż.",
  openGraph: {
    title: "WnetrzeAI — AI Virtual Staging dla Agentów Nieruchomości",
    description:
      "Puste mieszkanie urządzone w 30 sekund. AI dodaje meble i dekoracje do zdjęć nieruchomości.",
    type: "website",
    locale: "pl_PL",
  },
  twitter: {
    card: "summary_large_image",
  },
  other: {
    "theme-color": "#0a0a0f",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0f] text-[#fafafa] antialiased font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
