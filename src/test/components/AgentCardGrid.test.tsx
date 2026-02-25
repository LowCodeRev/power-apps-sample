import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentCardGrid } from "../../components/AgentCardGrid";
import type { Agent, Upvote, Comment } from "../../types";

const agents: Agent[] = [
  {
    id: "1",
    name: "Agent One",
    description: "First agent",
    link: "https://example.com/1",
    builderType: "copilot-studio",
    connectors: [],
    submittedBy: "user@test.com",
    submittedByName: "Test User",
    submittedAt: "2026-01-15T10:00:00Z",
    upvoteCount: 5,
  },
  {
    id: "2",
    name: "Agent Two",
    description: "Second agent",
    link: "https://example.com/2",
    builderType: "agent-builder",
    connectors: [],
    submittedBy: "user2@test.com",
    submittedByName: "Test User 2",
    submittedAt: "2026-02-01T10:00:00Z",
    upvoteCount: 10,
  },
];

const upvotes: Upvote[] = [
  { id: "uv-1", agentId: "1", userId: "user-1" },
];

const comments: Comment[] = [
  {
    id: "c-1",
    agentId: "1",
    text: "Great!",
    authorId: "user-2",
    authorName: "Bob",
    createdAt: "2026-01-20T10:00:00Z",
  },
];

describe("AgentCardGrid", () => {
  it("renders all agent cards", () => {
    render(
      <AgentCardGrid
        agents={agents}
        upvotes={upvotes}
        comments={comments}
        userId="user-1"
        onUpvote={() => {}}
        onSelectAgent={() => {}}
      />,
    );
    expect(screen.getByText("Agent One")).toBeInTheDocument();
    expect(screen.getByText("Agent Two")).toBeInTheDocument();
  });

  it("renders empty state when no agents", () => {
    render(
      <AgentCardGrid
        agents={[]}
        upvotes={[]}
        comments={[]}
        userId="user-1"
        onUpvote={() => {}}
        onSelectAgent={() => {}}
      />,
    );
    expect(screen.getByText("No agents found")).toBeInTheDocument();
  });

  it("calls onSelectAgent with the correct id", async () => {
    const onSelectAgent = vi.fn();
    const { container } = render(
      <AgentCardGrid
        agents={agents}
        upvotes={upvotes}
        comments={comments}
        userId="user-1"
        onUpvote={() => {}}
        onSelectAgent={onSelectAgent}
      />,
    );
    const cards = container.querySelectorAll(".agent-card");
    cards[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onSelectAgent).toHaveBeenCalledWith("1");
  });
});
