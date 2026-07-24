import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Abroad Application Portal",
  description:
    "Discover foreign universities, check eligibility, submit documents, and apply — with agency support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
