import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommentSection } from "../../components/CommentSection";
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
];

describe("CommentSection", () => {
  it("renders the comment count in the title", () => {
    render(
      <CommentSection comments={comments} onAddComment={() => {}} currentUserName="Test" />,
    );
    expect(screen.getByText("Comments (2)")).toBeInTheDocument();
  });

  it("renders each comment's text", () => {
    render(
      <CommentSection comments={comments} onAddComment={() => {}} currentUserName="Test" />,
    );
    expect(screen.getByText("Great agent!")).toBeInTheDocument();
    expect(screen.getByText("Very useful")).toBeInTheDocument();
  });

  it("renders author names", () => {
    render(
      <CommentSection comments={comments} onAddComment={() => {}} currentUserName="Test" />,
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders empty state when no comments", () => {
    render(
      <CommentSection comments={[]} onAddComment={() => {}} currentUserName="Test" />,
    );
    expect(screen.getByText("No comments yet. Be the first!")).toBeInTheDocument();
  });

  it("renders the comment input", () => {
    render(
      <CommentSection comments={[]} onAddComment={() => {}} currentUserName="Test" />,
    );
    expect(screen.getByPlaceholderText("Add a comment...")).toBeInTheDocument();
  });

  it("disables submit button when input is empty", () => {
    render(
      <CommentSection comments={[]} onAddComment={() => {}} currentUserName="Test" />,
    );
    expect(screen.getByText("Post")).toBeDisabled();
  });

  it("calls onAddComment with trimmed text and clears input", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(
      <CommentSection comments={[]} onAddComment={onAddComment} currentUserName="Test" />,
    );
    await user.type(screen.getByPlaceholderText("Add a comment..."), "New comment  ");
    await user.click(screen.getByText("Post"));
    expect(onAddComment).toHaveBeenCalledWith("New comment");
    expect(screen.getByPlaceholderText("Add a comment...")).toHaveValue("");
  });

  it("does not submit whitespace-only input", async () => {
    const user = userEvent.setup();
    const onAddComment = vi.fn();
    render(
      <CommentSection comments={[]} onAddComment={onAddComment} currentUserName="Test" />,
    );
    await user.type(screen.getByPlaceholderText("Add a comment..."), "   ");
    await user.click(screen.getByText("Post"));
    expect(onAddComment).not.toHaveBeenCalled();
  });
});
