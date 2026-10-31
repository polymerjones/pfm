import type { Metadata } from "next";
import GamesHub from "./_components/GamesHub";
import "./games.css";

export const metadata: Metadata = {
  title: "Games by Polymer Jones",
  description: "Monkey Trubble, Poly Oracle and more: play them right here, then get them for your phone.",
  openGraph: {
    title: "Games by Polymer Jones",
    description: "Monkey Trubble, Poly Oracle and more: play them right here, then get them for your phone.",
    url: "https://paulfishermedia.com/games",
    siteName: "Paul Fisher Media",
    type: "website",
    images: [{ url: "/games/og/hub.jpg", width: 1200, height: 630, alt: "Games by Polymer Jones" }],
  },
  twitter: { card: "summary_large_image", title: "Games by Polymer Jones", images: ["/games/og/hub.jpg"] },
};

export default function GamesPage() {
  return <GamesHub />;
}
