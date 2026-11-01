/** Where tips go (Ko-fi). The tip card, header meter and site footer show only while it's set. */
export const TIP_URL: string | undefined = "https://ko-fi.com/polymerjones";

export type Milestone = { at: number; label: string; icon: string; link?: string };
export type Pitch = { key: "A" | "B" | "C"; title: string; line: string; image?: string };

/**
 * The Next Game Fund. `base` is added to what the Ko-fi webhook has counted, for anything given
 * before the webhook was hooked up. Milestones light up along the bar as the total passes them;
 * add a `link` (a devlog post, say) once a prize is delivered.
 */
export const TIP_GOAL = {
  title: "Next Game Fund",
  base: 0,
  target: 500,
  milestones: [
    { at: 100, label: "Concept art drop", icon: "🎨" },
    { at: 250, label: "Devlog video", icon: "🎬" },
    { at: 500, label: "Next game greenlit", icon: "🕹️" },
  ] as Milestone[],
};

/** Next-game pitches supporters vote on ("VOTE A" in their Ko-fi message). Empty = vote hidden. */
export const NEXT_GAME_PITCHES: Pitch[] = [];

/** What /api/fund returns. Amounts are whole dollars. */
export type FundSnapshot = {
  raised: number;
  latest?: { name: string; at: number };
  wall: { name: string; amount: number }[];
  guestbook: { name: string; message: string; at: number }[];
  votes: Record<string, number>;
};

/** Pull a vote out of a Ko-fi message: "VOTE A", "vote: b", "#voteC", or a pitch's exact title. */
export function parseVote(message: string | undefined, pitches: Pitch[] = NEXT_GAME_PITCHES): Pitch["key"] | undefined {
  if (!message || pitches.length === 0) return undefined;
  const tagged = message.match(/vote[\s:#-]*([abc])\b/i)?.[1]?.toUpperCase();
  const byTag = pitches.find((pitch) => pitch.key === tagged);
  if (byTag) return byTag.key;
  const lower = message.toLowerCase();
  return pitches.find((pitch) => lower.includes(pitch.title.toLowerCase()))?.key;
}
