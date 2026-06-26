import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";
import { getStateMtime } from "@/lib/data";

export const metadata: Metadata = {
  title: "Backend Mastery",
  description: "Local dashboard for the AI-powered backend learning system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastUpdated = getStateMtime();
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-900 text-zinc-100">
        <Nav lastUpdated={lastUpdated} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
