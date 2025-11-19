import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ValuForesight – FAANG DCF",
  description: "Interactive FAANG DCF valuation engine.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 antialiased">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </div>
      </body>
    </html>
  );
}