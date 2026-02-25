import type { Agent, Upvote, Comment } from "../types";
import type { Cia_agentsesBase, Cia_agentses } from "../generated/models/Cia_agentsesModel";
import type { Cia_commentsBase, Cia_comments } from "../generated/models/Cia_commentsModel";
import type { Cia_upvotesesBase, Cia_upvoteses } from "../generated/models/Cia_upvotesesModel";
import {
  mockAgents,
  mockUpvotes,
  mockComments,
} from "../data/mockData";

// --- Lazy service loaders ---
// Generated services eagerly call getClient(dataSourcesInfo) at the class level.
// Dynamic imports defer that initialization into withFallback's try/catch, so if
// the Power Apps runtime isn't ready yet (or we're running locally), the error is
// caught and we gracefully fall back to mock data.

async function getAgentsService() {
  const { Cia_agentsesService } = await import("../generated/services/Cia_agentsesService");
  return Cia_agentsesService;
}
async function getUpvotesService() {
  const { Cia_upvotesesService } = await import("../generated/services/Cia_upvotesesService");
  return Cia_upvotesesService;
}
async function getCommentsService() {
  const { Cia_commentsService } = await import("../generated/services/Cia_commentsService");
  return Cia_commentsService;
}
async function getUsersService() {
  const { SystemusersService } = await import("../generated/services/SystemusersService");
  return SystemusersService;
}

// --- Payload types for create operations ---
// Exclude primary key (auto-generated) and ownership fields (auto-set by Dataverse).
// OData bind fields already exist in base types as optional; re-declared here as
// required where lookups are mandatory for the create call.

type CreateAgentPayload = Omit<Cia_agentsesBase, "cia_agentsid" | "ownerid" | "owneridtype" | "statecode">;

type CreateUpvotePayload = Omit<Cia_upvotesesBase, "cia_upvotesid" | "ownerid" | "owneridtype" | "statecode"> & {
  "cia_Agent@odata.bind": string;
  "cia_User@odata.bind": string;
};

type CreateCommentPayload = Omit<Cia_commentsBase, "cia_commentid" | "ownerid" | "owneridtype" | "statecode"> & {
  "cia_Agent@odata.bind": string;
  "cia_User@odata.bind": string;
};

// --- Runtime detection ---
// Power Apps code apps don't expose window.Xrm. Instead we detect Dataverse
// by attempting the first SDK call and caching the outcome.

let _isDataverse: boolean | null = null;
let _fallbackReason: string | null = null;

export function isDataverseAvailable(): boolean {
  return _isDataverse === true;
}

/** Returns the error message if the app fell back to mock mode, null otherwise. */
export function getFallbackReason(): string | null {
  return _fallbackReason;
}

/**
 * Try a Dataverse operation; on first call, if it fails we assume we're
 * running locally and fall back to mock data. Once determined, the result
 * is cached so subsequent calls skip the try/catch overhead.
 */
async function withFallback<T>(
  dataverseFn: () => Promise<T>,
  mockFn: () => T,
): Promise<T> {
  if (_isDataverse === false) return mockFn();

  try {
    const result = await dataverseFn();
    _isDataverse = true;
    return result;
  } catch (err) {
    if (_isDataverse === null) {
      // First failure — Dataverse SDK not functional (local dev)
      const message = err instanceof Error ? err.message : String(err);
      _fallbackReason = message;
      console.warn("[Agent Catalog] Dataverse unavailable, using mock data. Reason:", message);
      _isDataverse = false;
      return mockFn();
    }
    // Dataverse was previously working — surface the real error
    throw err;
  }
}

// --- Current user systemuserid resolution ---
// Power Apps context provides Azure AD objectId, but Dataverse OData binds
// need the systemuserid. These are usually the same GUID but can differ.

let _resolvedSystemUserId: string | null = null;

/**
 * Resolves the current user's Dataverse systemuserid from their Azure AD objectId.
 * Falls back to the objectId if Dataverse is unavailable or lookup fails.
 */
export async function resolveSystemUserId(azureObjectId: string): Promise<string> {
  if (_resolvedSystemUserId) return _resolvedSystemUserId;
  if (!isDataverseAvailable()) {
    _resolvedSystemUserId = azureObjectId;
    return azureObjectId;
  }

  try {
    const service = await getUsersService();
    const result = await service.getAll({
      select: ["systemuserid"],
      filter: `azureactivedirectoryobjectid eq '${azureObjectId}'`,
      top: 1,
    });
    const users = result.data ?? [];
    if (users.length > 0 && users[0].systemuserid) {
      _resolvedSystemUserId = users[0].systemuserid;
      return _resolvedSystemUserId;
    }
  } catch (err) {
    console.warn("[Agent Catalog] Failed to resolve systemuserid, using objectId:", err);
  }

  // Fallback: in most environments objectId === systemuserid
  _resolvedSystemUserId = azureObjectId;
  return azureObjectId;
}

// --- Picklist mappings ---

const TOOL_USED_TO_BUILDER: Record<number, Agent["builderType"]> = {
  767150000: "agent-builder",
  767150001: "copilot-studio",
};

const BUILDER_TO_TOOL_USED: Record<Agent["builderType"], number> = {
  "agent-builder": 767150000,
  "copilot-studio": 767150001,
};

// --- Helpers ---

const COMMENT_NAME_PREFIX = "Comment by ";

/** Extract author name from cia_commentname ("Comment by Alice Smith" → "Alice Smith"). */
function authorFromCommentName(name: string | undefined): string {
  if (name?.startsWith(COMMENT_NAME_PREFIX)) {
    return name.slice(COMMENT_NAME_PREFIX.length);
  }
  return "";
}

/**
 * Cast a create payload to the type expected by a generated service's create() method.
 * Generated services require ownership fields (ownerid, owneridtype, statecode),
 * but Dataverse auto-sets them — callers correctly exclude them from payload types.
 */
function asCreateRecord<T>(payload: Record<string, unknown>): T {
  return payload as T;
}

// --- Dataverse <-> App type mappers ---

function mapDvToAgent(r: Cia_agentses): Agent {
  return {
    id: r.cia_agentsid,
    name: r.cia_agentname ?? "",
    description: r.cia_description ?? "",
    link: r.cia_linktoagent ?? "",
    builderType: TOOL_USED_TO_BUILDER[r.cia_toolused as unknown as number] ?? "copilot-studio",
    connectors: r.cia_connectors
      ? r.cia_connectors.split(",").map((c) => c.trim()).filter(Boolean)
      : [],
    submittedBy: r._createdby_value ?? "",
    submittedByName: r.createdbyname ?? "",
    submittedAt: r.createdon ?? "",
    upvoteCount: r.cia_upvotes ? Number(r.cia_upvotes) : 0,
  };
}

function mapDvToUpvote(r: Cia_upvoteses): Upvote {
  return {
    id: r.cia_upvotesid,
    agentId: r._cia_agent_value ?? "",
    userId: r._cia_user_value ?? "",
  };
}

function mapDvToComment(r: Cia_comments): Comment {
  return {
    id: r.cia_commentid,
    agentId: r._cia_agent_value ?? "",
    text: r.cia_comment ?? "",
    authorId: r._cia_user_value ?? "",
    authorName: r.cia_username ?? r.createdbyname ?? authorFromCommentName(r.cia_commentname),
    createdAt: r.createdon ?? "",
  };
}

// --- Creator name resolution ---
// createdbyname is an OData formatted value annotation — not guaranteed to be
// returned. When missing, resolve display names from systemusers via the
// _createdby_value GUID that IS reliably returned.

async function resolveAgentCreatorNames(agents: Agent[]): Promise<void> {
  const missingNameIds = [...new Set(
    agents
      .filter(a => a.submittedBy && !a.submittedByName)
      .map(a => a.submittedBy),
  )];

  if (missingNameIds.length === 0) return;

  try {
    const userService = await getUsersService();
    const filter = missingNameIds
      .map(id => `systemuserid eq '${id}'`)
      .join(" or ");
    const result = await userService.getAll({
      select: ["systemuserid", "fullname"],
      filter,
      top: missingNameIds.length,
    });

    const nameMap = new Map(
      (result.data ?? []).map(u => [u.systemuserid, u.fullname ?? ""]),
    );

    for (const agent of agents) {
      if (!agent.submittedByName && agent.submittedBy) {
        agent.submittedByName = nameMap.get(agent.submittedBy) ?? "";
      }
    }
  } catch (err) {
    console.warn("[Agent Catalog] Failed to resolve creator names:", err);
  }
}

// --- CRUD: Agents ---

export async function fetchAgents(): Promise<Agent[]> {
  return withFallback(
    async () => {
      const service = await getAgentsService();
      const result = await service.getAll({
        select: [
          "cia_agentsid", "cia_agentname", "cia_description",
          "cia_linktoagent", "cia_toolused", "cia_connectors",
          "cia_upvotes", "_createdby_value", "createdon",
        ],
        orderBy: ["createdon desc"],
        top: 5000,
      });
      const agents = (result.data ?? []).map(mapDvToAgent);
      await resolveAgentCreatorNames(agents);
      return agents;
    },
    () => [...mockAgents],
  );
}

export async function createAgent(
  agent: Omit<Agent, "id" | "submittedAt" | "upvoteCount">,
): Promise<Agent> {
  return withFallback(
    async () => {
      const service = await getAgentsService();
      const payload: CreateAgentPayload = {
        cia_agentname: agent.name,
        cia_description: agent.description,
        cia_linktoagent: agent.link,
        cia_toolused: BUILDER_TO_TOOL_USED[agent.builderType] as CreateAgentPayload["cia_toolused"],
        cia_connectors: agent.connectors.join(", "),
        cia_upvotes: "0",
      };
      const result = await service.create(asCreateRecord<Omit<Cia_agentsesBase, "cia_agentsid">>(payload));
      return mapDvToAgent(result.data);
    },
    () => ({
      ...agent,
      id: `agent-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      upvoteCount: 0,
    }),
  );
}

// --- CRUD: Upvotes ---

export async function fetchUpvotes(): Promise<Upvote[]> {
  return withFallback(
    async () => {
      const service = await getUpvotesService();
      const result = await service.getAll({
        select: ["cia_upvotesid", "_cia_agent_value", "_cia_user_value"],
        top: 5000,
      });
      return (result.data ?? []).map(mapDvToUpvote);
    },
    () => [...mockUpvotes],
  );
}

export async function createUpvote(
  agentId: string,
  userId: string,
): Promise<Upvote> {
  return withFallback(
    async () => {
      const service = await getUpvotesService();
      const payload: CreateUpvotePayload = {
        cia_name: `${userId}-${agentId}`,
        "cia_Agent@odata.bind": `/cia_agentses(${agentId})`,
        "cia_User@odata.bind": `/systemusers(${userId})`,
      };
      const result = await service.create(asCreateRecord<Omit<Cia_upvotesesBase, "cia_upvotesid">>(payload));
      return mapDvToUpvote(result.data);
    },
    () => ({
      id: `uv-${Date.now()}`,
      agentId,
      userId,
    }),
  );
}

export async function deleteUpvote(upvoteId: string): Promise<void> {
  if (!isDataverseAvailable()) return;
  const service = await getUpvotesService();
  await service.delete(upvoteId);
}

export async function updateAgentUpvoteCount(
  agentId: string,
  count: number,
): Promise<void> {
  if (!isDataverseAvailable()) return;
  const service = await getAgentsService();
  await service.update(agentId, {
    cia_upvotes: String(count),
  } as Partial<Omit<Cia_agentsesBase, "cia_agentsid">>);
}

// --- CRUD: Comments ---

export async function fetchComments(): Promise<Comment[]> {
  return withFallback(
    async () => {
      const service = await getCommentsService();
      const result = await service.getAll({
        select: [
          "cia_commentid", "cia_comment", "cia_commentname",
          "_cia_agent_value", "_cia_user_value",
          "createdon",
        ],
        orderBy: ["createdon desc"],
        top: 5000,
      });
      return (result.data ?? []).map(mapDvToComment);
    },
    () => [...mockComments],
  );
}

export async function createComment(
  agentId: string,
  text: string,
  userId: string,
  userName: string,
): Promise<Comment> {
  return withFallback(
    async () => {
      const service = await getCommentsService();
      const payload: CreateCommentPayload = {
        cia_commentname: `Comment by ${userName}`,
        cia_comment: text,
        "cia_Agent@odata.bind": `/cia_agentses(${agentId})`,
        "cia_User@odata.bind": `/systemusers(${userId})`,
      };
      const result = await service.create(asCreateRecord<Omit<Cia_commentsBase, "cia_commentid">>(payload));
      return mapDvToComment(result.data);
    },
    () => ({
      id: `comment-${Date.now()}`,
      agentId,
      text,
      authorId: userId,
      authorName: userName,
      createdAt: new Date().toISOString(),
    }),
  );
}
