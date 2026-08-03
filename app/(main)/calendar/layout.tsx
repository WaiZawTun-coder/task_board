import { CalendarProvider } from "@/context/CalendarContext";

export default function CalendarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CalendarProvider>{children}</CalendarProvider>;
}
