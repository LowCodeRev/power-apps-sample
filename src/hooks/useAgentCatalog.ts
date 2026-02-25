import { useState, useEffect, useCallback } from "react";
import type { Agent, Upvote, Comment } from "../types";
import {
  isDataverseAvailable,
  fetchAgents,
  fetchUpvotes,
  fetchComments,
  createAgent,
  createUpvote,
  deleteUpvote,
  updateAgentUpvoteCount,
  createComment,
} from "../services/dataverse";
import { hasUserUpvoted, getUpvoteCount } from "../utils/upvoteUtils";

export interface UseAgentCatalogResult {
  agents: Agent[];
  upvotes: Upvote[];
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  handleUpvote: (agentId: string, userId: string) => Promise<void>;
  handleAddComment: (
    agentId: string,
    text: string,
    userId: string,
    userName: string,
  ) => Promise<void>;
  handleSubmitAgent: (
    data: Omit<Agent, "id" | "submittedAt" | "upvoteCount">,
  ) => Promise<void>;
}

export function useAgentCatalog(): UseAgentCatalogResult {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [upvotes, setUpvotes] = useState<Upvote[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, u, c] = await Promise.all([
        fetchAgents(),
        fetchUpvotes(),
        fetchComments(),
      ]);
      setAgents(a);
      setUpvotes(u);
      setComments(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpvote = useCallback(
    async (agentId: string, userId: string) => {
      const alreadyUpvoted = hasUserUpvoted(upvotes, agentId, userId);
      const prevUpvotes = upvotes;
      const prevAgents = agents;

      if (alreadyUpvoted) {
        const existing = upvotes.find(
          (uv) => uv.agentId === agentId && uv.userId === userId,
        );
        if (!existing) return;

        // Optimistic update
        const newUpvotes = upvotes.filter((uv) => uv.id !== existing.id);
        setUpvotes(newUpvotes);
        const newCount = getUpvoteCount(newUpvotes, agentId);
        setAgents((prev) =>
          prev.map((a) =>
            a.id === agentId ? { ...a, upvoteCount: newCount } : a,
          ),
        );

        try {
          await deleteUpvote(existing.id);
          await updateAgentUpvoteCount(agentId, newCount);
        } catch {
          // Rollback on failure
          setUpvotes(prevUpvotes);
          setAgents(prevAgents);
        }
      } else {
        try {
          const newUpvote = await createUpvote(agentId, userId);
          const newUpvotes = [...upvotes, newUpvote];
          setUpvotes(newUpvotes);
          const newCount = getUpvoteCount(newUpvotes, agentId);
          setAgents((prev) =>
            prev.map((a) =>
              a.id === agentId ? { ...a, upvoteCount: newCount } : a,
            ),
          );

          await updateAgentUpvoteCount(agentId, newCount);
        } catch {
          // Rollback on failure
          setUpvotes(prevUpvotes);
          setAgents(prevAgents);
        }
      }
    },
    [upvotes, agents],
  );

  const handleAddComment = useCallback(
    async (
      agentId: string,
      text: string,
      userId: string,
      userName: string,
    ) => {
      try {
        const newComment = await createComment(agentId, text, userId, userName);
        setComments((prev) => [newComment, ...prev]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add comment");
      }
    },
    [],
  );

  const handleSubmitAgent = useCallback(
    async (
      data: Omit<Agent, "id" | "submittedAt" | "upvoteCount">,
    ) => {
      try {
        const newAgent = await createAgent(data);
        setAgents((prev) => [newAgent, ...prev]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit agent");
      }
    },
    [],
  );

  // In Dataverse mode, if the upvote counts on agents might be stale,
  // recalculate from the upvotes array after load
  useEffect(() => {
    if (!isDataverseAvailable() || upvotes.length === 0) return;
    setAgents((prev) =>
      prev.map((a) => ({
        ...a,
        upvoteCount: getUpvoteCount(upvotes, a.id),
      })),
    );
  }, [upvotes]);

  return {
    agents,
    upvotes,
    comments,
    loading,
    error,
    refresh: load,
    handleUpvote,
    handleAddComment,
    handleSubmitAgent,
  };
}
