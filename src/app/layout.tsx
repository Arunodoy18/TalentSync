import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ThemeProvider } from "@/components/theme-provider";
import { PostHogProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentSync — AI Resume Builder & Job Matcher for India",
  description:
    "Build ATS-optimized resumes, get AI job matching, and auto-apply to top companies in Bangalore, Pune, Mumbai. Free ATS score checker.",
  keywords:
    "resume builder india, ATS score checker, job matching AI, SDE resume, fresher resume template, IIT resume format, Jake resume template",
  openGraph: {
    title: "TalentSync — AI Career Platform",
    description: "Build ATS-proof resumes and get matched to real jobs",
    url: "https://talentsync.buildc3.tech",
    siteName: "TalentSync",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TalentSync — AI Resume Builder",
    description: "ATS score + job matching + auto-apply for Indian devs",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://talentsync.buildc3.tech"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="theme-plum" enableSystem={false} themes={["theme-plum", "theme-cyprus"]}>
            {children}
            <VisualEditsMessenger />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}




