import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Askela × MAR‑EKON — Klientský portál (demo)",
  description:
    "Klikatelné demo klientského portálu pro účetní kancelář MAR‑EKON: onboarding, sběr podkladů, termíny a přehledy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
