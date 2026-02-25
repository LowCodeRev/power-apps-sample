import type { Agent } from "../types";
import { UpvoteButton } from "./UpvoteButton";
import "./AgentCard.css";

interface AgentCardProps {
  agent: Agent;
  upvoted: boolean;
  onUpvote: () => void;
  onClick: () => void;
  commentCount: number;
}

function builderLabel(type: Agent["builderType"]): string {
  return type === "copilot-studio" ? "Copilot Studio" : "Agent Builder";
}

export function AgentCard({
  agent,
  upvoted,
  onUpvote,
  onClick,
  commentCount,
}: AgentCardProps) {
  return (
    <div
      className="agent-card"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="agent-card-header">
        <h3 className="agent-card-name">{agent.name}</h3>
        <span
          className={`builder-badge builder-badge-${agent.builderType}`}
        >
          {builderLabel(agent.builderType)}
        </span>
      </div>
      <p className="agent-card-description">{agent.description}</p>
      {agent.builderType === "copilot-studio" && agent.connectors.length > 0 && (
        <div className="agent-card-connectors">
          {agent.connectors.map((c) => (
            <span key={c} className="connector-chip">
              {c}
            </span>
          ))}
        </div>
      )}
      <div className="agent-card-footer">
        <UpvoteButton
          count={agent.upvoteCount}
          active={upvoted}
          onClick={onUpvote}
        />
        <span className="comment-count">
          {commentCount} {commentCount === 1 ? "comment" : "comments"}
        </span>
        <span className="submitted-by">by {agent.submittedByName}</span>
      </div>
    </div>
  );
}
