import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentCard } from "../../components/AgentCard";
import type { Agent } from "../../types";

const agent: Agent = {
  id: "1",
  name: "Test Agent",
  description: "A test agent description",
  link: "https://example.com",
  builderType: "copilot-studio",
  connectors: ["ServiceNow", "SharePoint"],
  submittedBy: "user@test.com",
  submittedByName: "Test User",
  submittedAt: "2026-01-15T10:00:00Z",
  upvoteCount: 5,
};

describe("AgentCard", () => {
  it("renders the agent name", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={3} />,
    );
    expect(screen.getByText("Test Agent")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={0} />,
    );
    expect(screen.getByText("A test agent description")).toBeInTheDocument();
  });

  it("renders builder type badge for copilot-studio", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={0} />,
    );
    expect(screen.getByText("Copilot Studio")).toBeInTheDocument();
  });

  it("renders builder type badge for agent-builder", () => {
    const abAgent = { ...agent, builderType: "agent-builder" as const };
    render(
      <AgentCard agent={abAgent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={0} />,
    );
    expect(screen.getByText("Agent Builder")).toBeInTheDocument();
  });

  it("renders connector chips only for copilot-studio", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={0} />,
    );
    expect(screen.getByText("ServiceNow")).toBeInTheDocument();
    expect(screen.getByText("SharePoint")).toBeInTheDocument();
  });

  it("does not render connector chips for agent-builder", () => {
    const abAgent = { ...agent, builderType: "agent-builder" as const, connectors: ["Teams"] };
    render(
      <AgentCard agent={abAgent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={0} />,
    );
    expect(screen.queryByText("Teams")).not.toBeInTheDocument();
  });

  it("renders upvote count", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={0} />,
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders comment count", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={3} />,
    );
    expect(screen.getByText("3 comments")).toBeInTheDocument();
  });

  it("renders singular comment label", () => {
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={() => {}} commentCount={1} />,
    );
    expect(screen.getByText("1 comment")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={onClick} commentCount={0} />,
    );
    await user.click(screen.getByRole("button", { name: /test agent/i }));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onUpvote when upvote button is clicked without calling onClick", async () => {
    const user = userEvent.setup();
    const onUpvote = vi.fn();
    const onClick = vi.fn();
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={onUpvote} onClick={onClick} commentCount={0} />,
    );
    await user.click(screen.getByRole("button", { name: /upvote/i }));
    expect(onUpvote).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when Enter key is pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={onClick} commentCount={0} />,
    );
    const card = screen.getByRole("button", { name: /test agent/i });
    card.focus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onClick when Space key is pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <AgentCard agent={agent} upvoted={false} onUpvote={() => {}} onClick={onClick} commentCount={0} />,
    );
    const card = screen.getByRole("button", { name: /test agent/i });
    card.focus();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalled();
  });
});
