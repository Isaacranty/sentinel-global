import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import VerifyEmailBanner from "@/components/VerifyEmailBanner";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sentinel — Global Security Intel & Learning",
  description:
    "Threat intel, learning paths, and CTF signals for the global security community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${mono.variable} font-body`}>
        <Providers>
          <VerifyEmailBanner />
          {children}
        </Providers>
      </body>
    </html>
  );
}
