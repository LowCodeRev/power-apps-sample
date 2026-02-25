import type { Agent, Comment } from "../types";
import { UpvoteButton } from "./UpvoteButton";
import { CommentSection } from "./CommentSection";
import { Avatar } from "./Avatar";
import "./AgentDetail.css";

interface AgentDetailProps {
  agent: Agent;
  comments: Comment[];
  upvoted: boolean;
  onUpvote: () => void;
  onBack: () => void;
  onAddComment: (text: string) => void;
  currentUserName: string;
}

function builderLabel(type: Agent["builderType"]): string {
  return type === "copilot-studio" ? "Copilot Studio" : "Agent Builder";
}

export function AgentDetail({
  agent,
  comments,
  upvoted,
  onUpvote,
  onBack,
  onAddComment,
  currentUserName,
}: AgentDetailProps) {
  return (
    <div className="agent-detail">
      <button className="back-btn" onClick={onBack}>
        &larr; Back to catalog
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title-row">
            <h2 className="detail-name">{agent.name}</h2>
            <span
              className={`builder-badge builder-badge-${agent.builderType}`}
            >
              {builderLabel(agent.builderType)}
            </span>
          </div>
          <div className="detail-actions">
            <UpvoteButton
              count={agent.upvoteCount}
              active={upvoted}
              onClick={onUpvote}
            />
            <a
              className="detail-link"
              href={agent.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              Open Agent &rarr;
            </a>
          </div>
        </div>

        <p className="detail-description">{agent.description}</p>

        {agent.builderType === "copilot-studio" && agent.connectors.length > 0 && (
          <div className="detail-section">
            <h4 className="detail-section-title">Actions / Connectors</h4>
            <div className="detail-connectors">
              {agent.connectors.map((c) => (
                <span key={c} className="connector-chip">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="detail-meta">
          <div className="detail-submitter">
            <Avatar name={agent.submittedByName} size={24} />
            <span>Submitted by {agent.submittedByName}</span>
          </div>
          <span className="detail-date">
            {new Date(agent.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <CommentSection
        comments={comments}
        onAddComment={onAddComment}
        currentUserName={currentUserName}
      />
    </div>
  );
}
