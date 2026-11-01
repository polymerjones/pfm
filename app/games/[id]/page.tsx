import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import GamePage from "../_components/GamePage";
import { gameByID, playableGames } from "../_lib/catalog";
import "../games.css";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return playableGames.map((game) => ({ id: game.id }));
}

// Each game page unfolds as a rich card when shared (iMessage, Discord, X…) and is the QR target.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const game = gameByID((await params).id);
  if (!game) return {};
  const title = `${game.name} | Games by Polymer Jones`;
  const url = `https://paulfishermedia.com/games/${game.id}`;
  const image = { url: `/games/og/${game.id}.jpg`, width: 1200, height: 630, alt: game.name };
  return {
    title,
    description: `${game.tagline} ${game.summary}`,
    alternates: { canonical: url },
    openGraph: { title, description: game.tagline, url, siteName: "Paul Fisher Media", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description: game.tagline, images: [image.url] },
  };
}

export default async function GameRoute({ params }: Params) {
  const game = gameByID((await params).id);
  if (!game || game.kind === "sponsor") notFound();
  // Nothing to play yet: shared links land on the hub with its In Development card in front.
  if (game.kind === "inDevelopment") redirect(`/games?game=${game.id}`);
  return <GamePage game={game} />;
}
