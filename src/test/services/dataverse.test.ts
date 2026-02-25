import { describe, it, expect, vi, beforeEach } from "vitest";

// Fresh module state per test — dynamic imports after resetModules()
// ensure _isDataverse and other caches start clean.

function createMockServices() {
  const mockAgentsGetAll = vi.fn().mockResolvedValue({ data: [] });
  const mockAgentsCreate = vi.fn().mockResolvedValue({ data: { cia_agentsid: "new-1" } });
  const mockAgentsUpdate = vi.fn().mockResolvedValue({});
  const mockUpvotesGetAll = vi.fn().mockResolvedValue({ data: [] });
  const mockUpvotesCreate = vi.fn().mockResolvedValue({ data: { cia_upvotesid: "uv-1" } });
  const mockUpvotesDelete = vi.fn().mockResolvedValue(undefined);
  const mockCommentsGetAll = vi.fn().mockResolvedValue({ data: [] });
  const mockCommentsCreate = vi.fn().mockResolvedValue({ data: { cia_commentid: "c-1" } });
  const mockUsersGetAll = vi.fn().mockResolvedValue({ data: [] });

  return {
    mockAgentsGetAll,
    mockAgentsCreate,
    mockAgentsUpdate,
    mockUpvotesGetAll,
    mockUpvotesCreate,
    mockUpvotesDelete,
    mockCommentsGetAll,
    mockCommentsCreate,
    mockUsersGetAll,
    register() {
      vi.doMock("../../generated/services/Cia_agentsesService", () => ({
        Cia_agentsesService: {
          getAll: mockAgentsGetAll,
          create: mockAgentsCreate,
          update: mockAgentsUpdate,
        },
      }));
      vi.doMock("../../generated/services/Cia_upvotesesService", () => ({
        Cia_upvotesesService: {
          getAll: mockUpvotesGetAll,
          create: mockUpvotesCreate,
          delete: mockUpvotesDelete,
        },
      }));
      vi.doMock("../../generated/services/Cia_commentsService", () => ({
        Cia_commentsService: {
          getAll: mockCommentsGetAll,
          create: mockCommentsCreate,
        },
      }));
      vi.doMock("../../generated/services/SystemusersService", () => ({
        SystemusersService: {
          getAll: mockUsersGetAll,
        },
      }));
    },
  };
}

describe("dataverse service", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("select parameters", () => {
    it("fetchAgents does not include formatted value fields in select", async () => {
      const mocks = createMockServices();
      mocks.register();

      const { fetchAgents } = await import("../../services/dataverse");
      await fetchAgents();

      expect(mocks.mockAgentsGetAll).toHaveBeenCalledOnce();
      const options = mocks.mockAgentsGetAll.mock.calls[0][0];

      // createdbyname is a formatted value annotation, not a real Dataverse column.
      // Including it in $select causes OData errors in production.
      expect(options.select).not.toContain("createdbyname");

      // These ARE real columns and should be included
      expect(options.select).toContain("cia_agentsid");
      expect(options.select).toContain("cia_agentname");
      expect(options.select).toContain("createdon");
      expect(options.select).toContain("_createdby_value");
    });

    it("fetchComments does not include formatted value fields in select", async () => {
      const mocks = createMockServices();
      mocks.register();

      const { fetchAgents, fetchComments } = await import("../../services/dataverse");
      await fetchAgents(); // warm up withFallback detection
      await fetchComments();

      expect(mocks.mockCommentsGetAll).toHaveBeenCalledOnce();
      const options = mocks.mockCommentsGetAll.mock.calls[0][0];

      // Formatted value fields (lookup display names) must NOT be in select
      expect(options.select).not.toContain("createdbyname");
      expect(options.select).not.toContain("cia_username");
      // Real columns should be included
      expect(options.select).toContain("cia_commentid");
      expect(options.select).toContain("cia_comment");
      expect(options.select).toContain("cia_commentname");
      expect(options.select).toContain("createdon");
    });
  });

  describe("mapper fallbacks", () => {
    it("extracts author name from cia_commentname when lookup display names are absent", async () => {
      const mocks = createMockServices();
      mocks.mockAgentsGetAll.mockResolvedValue({ data: [] });
      // Simulate Dataverse response with only base columns (no formatted values)
      mocks.mockCommentsGetAll.mockResolvedValue({
        data: [{
          cia_commentid: "c-1",
          cia_comment: "Great agent!",
          cia_commentname: "Comment by Alice Smith",
          _cia_agent_value: "agent-1",
          _cia_user_value: "user-1",
          createdon: "2026-01-15T10:00:00Z",
          // cia_username and createdbyname absent — formatted values not returned
        }],
      });
      mocks.register();

      const { fetchAgents, fetchComments } = await import("../../services/dataverse");
      await fetchAgents();
      const comments = await fetchComments();

      expect(comments).toHaveLength(1);
      expect(comments[0].authorName).toBe("Alice Smith");
    });
  });

  describe("creator name resolution", () => {
    it("resolves submittedByName from systemusers when createdbyname is absent", async () => {
      const mocks = createMockServices();
      mocks.mockAgentsGetAll.mockResolvedValue({
        data: [{
          cia_agentsid: "a-1",
          cia_agentname: "Test Agent",
          _createdby_value: "user-guid-123",
          createdon: "2026-01-15T10:00:00Z",
          // createdbyname absent — formatted value not returned
        }],
      });
      mocks.mockUsersGetAll.mockResolvedValue({
        data: [{ systemuserid: "user-guid-123", fullname: "Jane Doe" }],
      });
      mocks.register();

      const { fetchAgents } = await import("../../services/dataverse");
      const agents = await fetchAgents();

      expect(agents).toHaveLength(1);
      expect(agents[0].submittedByName).toBe("Jane Doe");
      expect(mocks.mockUsersGetAll).toHaveBeenCalledWith(
        expect.objectContaining({
          select: ["systemuserid", "fullname"],
          filter: "systemuserid eq 'user-guid-123'",
        }),
      );
    });

    it("keeps createdbyname when SDK returns it", async () => {
      const mocks = createMockServices();
      mocks.mockAgentsGetAll.mockResolvedValue({
        data: [{
          cia_agentsid: "a-1",
          cia_agentname: "Test Agent",
          _createdby_value: "user-guid-123",
          createdbyname: "Already Resolved",
          createdon: "2026-01-15T10:00:00Z",
        }],
      });
      mocks.register();

      const { fetchAgents } = await import("../../services/dataverse");
      const agents = await fetchAgents();

      expect(agents[0].submittedByName).toBe("Already Resolved");
      // Should NOT call systemusers — name already present
      expect(mocks.mockUsersGetAll).not.toHaveBeenCalled();
    });

    it("handles systemusers lookup failure gracefully", async () => {
      const mocks = createMockServices();
      mocks.mockAgentsGetAll.mockResolvedValue({
        data: [{
          cia_agentsid: "a-1",
          cia_agentname: "Test Agent",
          _createdby_value: "user-guid-123",
          createdon: "2026-01-15T10:00:00Z",
        }],
      });
      mocks.mockUsersGetAll.mockRejectedValue(new Error("Permission denied"));
      mocks.register();

      const { fetchAgents } = await import("../../services/dataverse");
      const agents = await fetchAgents();

      // Should not throw — falls back to empty string
      expect(agents).toHaveLength(1);
      expect(agents[0].submittedByName).toBe("");
    });
  });

  describe("withFallback behavior", () => {
    it("falls back to mock data when getAll returns undefined result", async () => {
      const mocks = createMockServices();
      // Simulate SDK returning undefined (happens when getClient is non-functional)
      mocks.mockAgentsGetAll.mockResolvedValue(undefined);
      mocks.register();

      const { fetchAgents, isDataverseAvailable } =
        await import("../../services/dataverse");
      const agents = await fetchAgents();

      // undefined.data throws → withFallback catches → falls back to mock
      expect(isDataverseAvailable()).toBe(false);
      expect(agents.length).toBe(6);
    });

    it("exposes fallback reason when Dataverse is unavailable", async () => {
      const mocks = createMockServices();
      mocks.mockAgentsGetAll.mockRejectedValue(new Error("SDK not initialized"));
      mocks.register();

      const { fetchAgents, isDataverseAvailable, getFallbackReason } =
        await import("../../services/dataverse");
      await fetchAgents();

      expect(isDataverseAvailable()).toBe(false);
      expect(getFallbackReason()).toBe("SDK not initialized");
    });

    it("re-throws errors after Dataverse was previously working", async () => {
      const mocks = createMockServices();
      // First call succeeds
      mocks.mockAgentsGetAll.mockResolvedValueOnce({ data: [] });
      // Second call fails
      mocks.mockAgentsGetAll.mockRejectedValueOnce(new Error("Transient error"));
      mocks.register();

      const { fetchAgents, isDataverseAvailable } =
        await import("../../services/dataverse");

      // First call — Dataverse detected as available
      await fetchAgents();
      expect(isDataverseAvailable()).toBe(true);

      // Second call — should throw, not fall back to mock
      await expect(fetchAgents()).rejects.toThrow("Transient error");
    });
  });
});
