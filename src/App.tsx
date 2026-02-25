import { useState, useEffect, useMemo, useRef } from "react";
import type { Agent } from "./types";
import { usePowerAppsContext } from "./hooks/usePowerAppsContext";
import { useAgentCatalog } from "./hooks/useAgentCatalog";
import { resolveSystemUserId } from "./services/dataverse";
import { filterAgents, sortAgents } from "./utils/agentUtils";
import type { SortBy, BuilderTypeFilter } from "./utils/agentUtils";
import { hasUserUpvoted } from "./utils/upvoteUtils";
import { getCommentsForAgent } from "./utils/commentUtils";
import { Header } from "./components/Header";
import { FilterBar } from "./components/FilterBar";
import { AgentCardGrid } from "./components/AgentCardGrid";
import { AgentDetail } from "./components/AgentDetail";
import { AgentForm } from "./components/AgentForm";
import { Modal } from "./components/Modal";
import { LAST_UPDATED } from "./version";
import "./App.css";

function App() {
  const context = usePowerAppsContext();
  const {
    agents,
    upvotes,
    comments,
    loading,
    error,
    handleUpvote,
    handleAddComment,
    handleSubmitAgent,
  } = useAgentCatalog();

  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("upvotes");
  const [builderFilter, setBuilderFilter] =
    useState<BuilderTypeFilter>("all");

  const objectId = context?.user.objectId ?? "dev-user-object-id";
  const userName = context?.user.fullName ?? "Dev User";
  const userEmail = context?.user.userPrincipalName ?? "dev@example.com";
  const userPhoto = context?.user.profilePhoto;

  // Resolve Dataverse systemuserid from Azure AD objectId after initial load
  const [userId, setUserId] = useState(objectId);
  useEffect(() => {
    if (!loading) {
      resolveSystemUserId(objectId).then(setUserId);
    }
  }, [loading, objectId]);

  const onUpvote = async (agentId: string) => {
    await handleUpvote(agentId, userId);
  };

  const onAddComment = async (agentId: string, text: string) => {
    await handleAddComment(agentId, text, userId, userName);
  };

  const onSubmitAgent = async (
    data: Omit<Agent, "id" | "submittedAt" | "upvoteCount">,
  ) => {
    await handleSubmitAgent(data);
    setShowForm(false);
  };

  const selectedAgent = agents.find((a) => a.id === selectedAgentId);

  // Stable sort: recompute order only when sort/filter/search/agent-list-size
  // changes — NOT on upvote count updates. Prevents cards jumping on upvote.
  // Uses a synchronous ref cache (not useEffect) to avoid a flash of empty state.
  const sortCacheRef = useRef<{
    ids: string[];
    sortBy: SortBy;
    searchQuery: string;
    builderFilter: BuilderTypeFilter;
    agentsLen: number;
  } | null>(null);

  const cached = sortCacheRef.current;
  if (
    !cached ||
    cached.sortBy !== sortBy ||
    cached.searchQuery !== searchQuery ||
    cached.builderFilter !== builderFilter ||
    cached.agentsLen !== agents.length
  ) {
    const sorted = sortAgents(
      filterAgents(agents, searchQuery, builderFilter),
      sortBy,
    );
    sortCacheRef.current = {
      ids: sorted.map((a) => a.id),
      sortBy,
      searchQuery,
      builderFilter,
      agentsLen: agents.length,
    };
  }
  const sortedIds = sortCacheRef.current!.ids;

  const filteredAndSorted = useMemo(() => {
    const agentMap = new Map(agents.map((a) => [a.id, a]));
    return sortedIds
      .map((id) => agentMap.get(id))
      .filter((a): a is Agent => a !== undefined);
  }, [agents, sortedIds]);

  if (loading) {
    return (
      <div className="app">
        <Header
          userName={userName}
          userPhoto={userPhoto}
          onSubmitAgent={() => setShowForm(true)}
        />
        <div className="loading-state">Loading agents...</div>
        <footer className="app-footer">Last updated {LAST_UPDATED}</footer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header
          userName={userName}
          userPhoto={userPhoto}
          onSubmitAgent={() => setShowForm(true)}
        />
        <div className="error-state">Error: {error}</div>
        <footer className="app-footer">Last updated {LAST_UPDATED}</footer>
      </div>
    );
  }

  if (selectedAgent) {
    const agentComments = getCommentsForAgent(comments, selectedAgent.id);

    return (
      <div className="app">
        <Header
          userName={userName}
          userPhoto={userPhoto}
          onSubmitAgent={() => setShowForm(true)}
        />
        <AgentDetail
          agent={selectedAgent}
          comments={agentComments}
          upvoted={hasUserUpvoted(upvotes, selectedAgent.id, userId)}
          onUpvote={() => onUpvote(selectedAgent.id)}
          onBack={() => setSelectedAgentId(null)}
          onAddComment={(text) => onAddComment(selectedAgent.id, text)}
          currentUserName={userName}
        />
        <Modal
          open={showForm}
          onClose={() => setShowForm(false)}
          title="Submit a New Agent"
        >
          <AgentForm
            onSubmit={onSubmitAgent}
            onCancel={() => setShowForm(false)}
            currentUserEmail={userEmail}
            currentUserName={userName}
          />
        </Modal>
        <footer className="app-footer">Last updated {LAST_UPDATED}</footer>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        userName={userName}
        userPhoto={userPhoto}
        onSubmitAgent={() => setShowForm(true)}
      />
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        builderFilter={builderFilter}
        onBuilderFilterChange={setBuilderFilter}
      />
      <AgentCardGrid
        agents={filteredAndSorted}
        upvotes={upvotes}
        comments={comments}
        userId={userId}
        onUpvote={onUpvote}
        onSelectAgent={setSelectedAgentId}
      />
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Submit a New Agent"
      >
        <AgentForm
          onSubmit={onSubmitAgent}
          onCancel={() => setShowForm(false)}
          currentUserEmail={userEmail}
          currentUserName={userName}
        />
      </Modal>
      <footer className="app-footer">Last updated {LAST_UPDATED}</footer>
    </div>
  );
}

export default App;
