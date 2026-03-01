import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paul Fisher Media",
  description: "Links to Poly Oracle, Poly Play, YouTube, and Contact.",
  metadataBase: new URL("https://paulfishermedia.com"),
  icons: {
    icon: [{ url: "/favicon.jpg?v=5", type: "image/jpeg" }],
    shortcut: "/favicon.jpg?v=5",
    apple: "/favicon.jpg?v=5"
  },
  openGraph: {
    title: "Paul Fisher Media",
    description: "Links to Poly Oracle, Poly Play, YouTube, and Contact.",
    url: "https://paulfishermedia.com",
    siteName: "Paul Fisher Media",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Paul Fisher Media",
    description: "Links to Poly Oracle, Poly Play, YouTube, and Contact."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
