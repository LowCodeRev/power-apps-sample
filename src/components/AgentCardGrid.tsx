import type { Agent, Upvote, Comment } from "../types";
import { hasUserUpvoted } from "../utils/upvoteUtils";
import { AgentCard } from "./AgentCard";
import "./AgentCardGrid.css";

interface AgentCardGridProps {
  agents: Agent[];
  upvotes: Upvote[];
  comments: Comment[];
  userId: string;
  onUpvote: (agentId: string) => void;
  onSelectAgent: (agentId: string) => void;
}

export function AgentCardGrid({
  agents,
  upvotes,
  comments,
  userId,
  onUpvote,
  onSelectAgent,
}: AgentCardGridProps) {
  if (agents.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state-text">No agents found</p>
        <p className="empty-state-hint">
          Try adjusting your search or filters, or submit a new agent.
        </p>
      </div>
    );
  }

  return (
    <div className="agent-card-grid">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          upvoted={hasUserUpvoted(upvotes, agent.id, userId)}
          onUpvote={() => onUpvote(agent.id)}
          onClick={() => onSelectAgent(agent.id)}
          commentCount={comments.filter((c) => c.agentId === agent.id).length}
        />
      ))}
    </div>
  );
}
