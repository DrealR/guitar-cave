import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guitar Cave",
  description:
    "Reemy's guitar study tool — the fretboard, every chord's anatomy (root · soul · spine), the practice loop, and the songs. The tool serves the reps.",
};

export const viewport: Viewport = {
  themeColor: "#0f1115",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-20 md:pb-0">
        <Nav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6">{children}</main>
        <footer className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10 text-center text-xs text-faint md:pb-10">
          The strum is time. The tool serves the reps — it does not replace them. 🎸
        </footer>
      </body>
    </html>
  );
}
