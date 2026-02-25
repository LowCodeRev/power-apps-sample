import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentDetail } from "../../components/AgentDetail";
import type { Agent, Comment } from "../../types";

const agent: Agent = {
  id: "1",
  name: "Test Agent",
  description: "A detailed description of the test agent",
  link: "https://example.com/agent",
  builderType: "copilot-studio",
  connectors: ["ServiceNow", "SharePoint"],
  submittedBy: "user@test.com",
  submittedByName: "Test User",
  submittedAt: "2026-01-15T10:00:00Z",
  upvoteCount: 5,
};

const comments: Comment[] = [
  {
    id: "c-1",
    agentId: "1",
    text: "Test comment",
    authorId: "user-2",
    authorName: "Bob",
    createdAt: "2026-01-20T10:00:00Z",
  },
];

describe("AgentDetail", () => {
  const defaultProps = {
    agent,
    comments,
    upvoted: false,
    onUpvote: vi.fn(),
    onBack: vi.fn(),
    onAddComment: vi.fn(),
    currentUserName: "Test User",
  };

  it("renders the agent name", () => {
    render(<AgentDetail {...defaultProps} />);
    expect(screen.getByText("Test Agent")).toBeInTheDocument();
  });

  it("renders the full description", () => {
    render(<AgentDetail {...defaultProps} />);
    expect(screen.getByText("A detailed description of the test agent")).toBeInTheDocument();
  });

  it("renders the builder type badge", () => {
    render(<AgentDetail {...defaultProps} />);
    expect(screen.getByText("Copilot Studio")).toBeInTheDocument();
  });

  it("renders connector chips for copilot-studio agents", () => {
    render(<AgentDetail {...defaultProps} />);
    expect(screen.getByText("ServiceNow")).toBeInTheDocument();
    expect(screen.getByText("SharePoint")).toBeInTheDocument();
  });

  it("does not render connectors for agent-builder agents", () => {
    const abAgent = { ...agent, builderType: "agent-builder" as const };
    render(<AgentDetail {...defaultProps} agent={abAgent} />);
    expect(screen.queryByText("ServiceNow")).not.toBeInTheDocument();
  });

  it("renders the submitter name", () => {
    render(<AgentDetail {...defaultProps} />);
    expect(screen.getByText(/Submitted by Test User/)).toBeInTheDocument();
  });

  it("renders the open agent link", () => {
    render(<AgentDetail {...defaultProps} />);
    const link = screen.getByText("Open Agent →");
    expect(link).toHaveAttribute("href", "https://example.com/agent");
  });

  it("calls onBack when back button is clicked", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    render(<AgentDetail {...defaultProps} onBack={onBack} />);
    await user.click(screen.getByText("← Back to catalog"));
    expect(onBack).toHaveBeenCalled();
  });

  it("renders the comment section with comments", () => {
    render(<AgentDetail {...defaultProps} />);
    expect(screen.getByText("Test comment")).toBeInTheDocument();
  });
});
