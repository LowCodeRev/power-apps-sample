import type { Upvote } from "../types";

export function toggleUpvote(
  upvotes: Upvote[],
  agentId: string,
  userId: string,
): Upvote[] {
  const existing = upvotes.find(
    (uv) => uv.agentId === agentId && uv.userId === userId,
  );

  if (existing) {
    return upvotes.filter((uv) => uv.id !== existing.id);
  }

  const newUpvote: Upvote = {
    id: `uv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    agentId,
    userId,
  };

  return [...upvotes, newUpvote];
}

export function hasUserUpvoted(
  upvotes: Upvote[],
  agentId: string,
  userId: string,
): boolean {
  return upvotes.some(
    (uv) => uv.agentId === agentId && uv.userId === userId,
  );
}

export function getUpvoteCount(upvotes: Upvote[], agentId: string): number {
  return upvotes.filter((uv) => uv.agentId === agentId).length;
}
