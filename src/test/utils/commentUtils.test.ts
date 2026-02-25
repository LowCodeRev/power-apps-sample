import { describe, it, expect, vi } from "vitest";
import { addComment, getCommentsForAgent } from "../../utils/commentUtils";
import type { Comment } from "../../types";

const comments: Comment[] = [
  {
    id: "c-1",
    agentId: "agent-1",
    text: "Great agent!",
    authorId: "user-1",
    authorName: "Alice",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "c-2",
    agentId: "agent-1",
    text: "Very useful",
    authorId: "user-2",
    authorName: "Bob",
    createdAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "c-3",
    agentId: "agent-2",
    text: "Needs improvement",
    authorId: "user-1",
    authorName: "Alice",
    createdAt: "2026-01-18T10:00:00Z",
  },
];

describe("addComment", () => {
  it("adds a new comment to the array", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    const result = addComment(comments, "agent-1", "New comment", "user-3", "Charlie");
    expect(result).toHaveLength(4);
    vi.restoreAllMocks();
  });

  it("new comment has correct properties", () => {
    const result = addComment(comments, "agent-1", "New comment", "user-3", "Charlie");
    const newComment = result[result.length - 1];
    expect(newComment.agentId).toBe("agent-1");
    expect(newComment.text).toBe("New comment");
    expect(newComment.authorId).toBe("user-3");
    expect(newComment.authorName).toBe("Charlie");
    expect(newComment.createdAt).toBeTruthy();
    expect(newComment.id).toBeTruthy();
  });

  it("does not mutate the original array", () => {
    const original = [...comments];
    addComment(comments, "agent-1", "New comment", "user-3", "Charlie");
    expect(comments).toEqual(original);
  });
});

describe("getCommentsForAgent", () => {
  it("returns only comments for the specified agent", () => {
    const result = getCommentsForAgent(comments, "agent-1");
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.agentId === "agent-1")).toBe(true);
  });

  it("sorts comments by date descending (newest first)", () => {
    const result = getCommentsForAgent(comments, "agent-1");
    expect(result[0].id).toBe("c-2");
    expect(result[1].id).toBe("c-1");
  });

  it("returns empty array for agent with no comments", () => {
    const result = getCommentsForAgent(comments, "agent-999");
    expect(result).toHaveLength(0);
  });
});
