import type { Comment } from "../types";

export function addComment(
  comments: Comment[],
  agentId: string,
  text: string,
  authorId: string,
  authorName: string,
): Comment[] {
  const newComment: Comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    agentId,
    text,
    authorId,
    authorName,
    createdAt: new Date().toISOString(),
  };

  return [...comments, newComment];
}

export function getCommentsForAgent(
  comments: Comment[],
  agentId: string,
): Comment[] {
  return comments
    .filter((c) => c.agentId === agentId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}
