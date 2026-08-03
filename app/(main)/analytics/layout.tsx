import { AnalyticsProvider } from "@/context/AnalyticsContext";

export default function AnalyticsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}
