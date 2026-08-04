import { AuthProvider } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { DM_Sans, Geist, Geist_Mono, Roboto } from "next/font/google";
import { ThemeProvider } from "../providers/themeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const dmSansHeading = DM_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
});

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Board",
  description: "A place to organize projects and tasks",
  icons: {
    icon: "/icon.ico",
  },
  openGraph: {
    title: "Task Board",
    description: "A place to organize projects and tasks",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        roboto.variable,
        dmSansHeading.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Project",
              name: "Task Board",
              jobTitle: "To Do App",
              url: "https://task-board.vercel.app",
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
