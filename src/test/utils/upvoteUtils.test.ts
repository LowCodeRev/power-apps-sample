import { describe, it, expect } from "vitest";
import {
  toggleUpvote,
  hasUserUpvoted,
  getUpvoteCount,
} from "../../utils/upvoteUtils";
import type { Upvote } from "../../types";

const upvotes: Upvote[] = [
  { id: "uv-1", agentId: "agent-1", userId: "user-1" },
  { id: "uv-2", agentId: "agent-1", userId: "user-2" },
  { id: "uv-3", agentId: "agent-2", userId: "user-1" },
];

describe("toggleUpvote", () => {
  it("adds an upvote when user has not upvoted", () => {
    const result = toggleUpvote(upvotes, "agent-2", "user-2");
    expect(result).toHaveLength(4);
    expect(result.some((uv) => uv.agentId === "agent-2" && uv.userId === "user-2")).toBe(true);
  });

  it("removes an upvote when user has already upvoted", () => {
    const result = toggleUpvote(upvotes, "agent-1", "user-1");
    expect(result).toHaveLength(2);
    expect(result.some((uv) => uv.agentId === "agent-1" && uv.userId === "user-1")).toBe(false);
  });

  it("does not mutate the original array", () => {
    const original = [...upvotes];
    toggleUpvote(upvotes, "agent-1", "user-1");
    expect(upvotes).toEqual(original);
  });

  it("generated upvote has a unique id", () => {
    const result = toggleUpvote(upvotes, "agent-3", "user-1");
    const newUpvote = result.find((uv) => uv.agentId === "agent-3");
    expect(newUpvote).toBeDefined();
    expect(newUpvote!.id).toBeTruthy();
    expect(upvotes.some((uv) => uv.id === newUpvote!.id)).toBe(false);
  });
});

describe("hasUserUpvoted", () => {
  it("returns true when user has upvoted the agent", () => {
    expect(hasUserUpvoted(upvotes, "agent-1", "user-1")).toBe(true);
  });

  it("returns false when user has not upvoted the agent", () => {
    expect(hasUserUpvoted(upvotes, "agent-2", "user-2")).toBe(false);
  });

  it("returns false for non-existent agent", () => {
    expect(hasUserUpvoted(upvotes, "agent-999", "user-1")).toBe(false);
  });
});

describe("getUpvoteCount", () => {
  it("returns correct count for agent with multiple upvotes", () => {
    expect(getUpvoteCount(upvotes, "agent-1")).toBe(2);
  });

  it("returns correct count for agent with one upvote", () => {
    expect(getUpvoteCount(upvotes, "agent-2")).toBe(1);
  });

  it("returns 0 for agent with no upvotes", () => {
    expect(getUpvoteCount(upvotes, "agent-999")).toBe(0);
  });
});
