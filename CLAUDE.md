# Agent Catalog - Project Guide

## Overview

Internal catalog app for browsing, submitting, upvoting, and commenting on AI agents built with Copilot Studio and Agent Builder. Users can discover agents, upvote useful ones, and leave feedback. Built with React 19 + TypeScript + Vite, running inside Microsoft Power Apps.

## Architecture

### Data Flow

Data comes from Dataverse when running inside Power Apps, with automatic fallback to mock data for local dev. The `withFallback` pattern in `src/services/dataverse.ts` detects Dataverse availability on the first SDK call and caches the result for all subsequent calls.

Flow: Dataverse SDK (via dynamic-imported generated services) -> `src/services/dataverse.ts` (mappers + fallback) -> `useAgentCatalog` hook -> components.

**Dynamic imports**: Generated services are loaded via `await import()` inside `withFallback`, NOT as top-level static imports. This defers `getClient(dataSourcesInfo)` initialization into the try/catch, so module-load-time errors are caught and trigger the mock fallback. Vite code-splits each service into a separate chunk.

**Select rules**: Only include real Dataverse columns in `select` arrays. Never include formatted value / lookup display name fields (`createdbyname`, `cia_username`, `owneridname`, etc.) — these are OData annotations, not columns, and cause query errors. System columns (`createdon`, `_createdby_value`) ARE selectable. Mappers use `??` fallbacks for any formatted fields the SDK may or may not return automatically.

### State Management

Single hook: `useAgentCatalog()` in `src/hooks/useAgentCatalog.ts` manages all agents, upvotes, and comments state. No Context providers — simpler than RF-v2's pattern, appropriate for this app's scope (single-page catalog with detail view).

Upvote toggle uses optimistic updates with try/catch rollback.

### Navigation

Two views managed by `selectedAgentId` state in `App.tsx`:
- **Grid view** (default) — FilterBar + AgentCardGrid, defaults to "Agent Builder" filter
- **Detail view** — AgentDetail with comments, triggered by selecting a card

Agent submission uses a Modal overlay, not a separate view.

## Dataverse Tables

| Table | Entity Set | Logical Name | Service |
|---|---|---|---|
| Agents | cia_agentses | cia_agents | Cia_agentsesService |
| Comments | cia_comments | cia_comment | Cia_commentsService |
| Upvotes | cia_upvoteses | cia_upvotes | Cia_upvotesesService |
| Users | systemusers | systemuser | SystemusersService |

Picklist: `cia_toolused` — 767150000 = Agent Builder, 767150001 = Copilot Studio.

## Known Issues

- No deep linking support (RF-v2 has this via `queryParams`)
- `fetchUpvotes()`/`fetchComments()` fetch up to 5000 records with no filter — may need on-demand loading per agent as usage grows
- `updateAgentUpvoteCount` writes client-calculated count — susceptible to concurrent overwrites in multi-user scenarios; consider a Dataverse rollup field for server-authoritative counts
- Handler functions in `App.tsx` (`onUpvote`, `onAddComment`, `onSubmitAgent`) are not wrapped in `useCallback` (minor perf concern)
- `toggleUpvote` utility in `upvoteUtils.ts` is defined and tested but never imported by production code (dead code)
- Modal lacks focus trapping and Escape key handling

## Key Files

| File | Purpose |
|---|---|
| `src/types.ts` | All interfaces (Agent, Upvote, Comment, PowerAppsContext) |
| `src/services/dataverse.ts` | Dataverse CRUD with typed payloads, mappers, mock fallback |
| `src/hooks/useAgentCatalog.ts` | Main data hook (agents, upvotes, comments, mutations) |
| `src/hooks/usePowerAppsContext.ts` | Power Apps context hook with dev fallback |
| `src/data/mockData.ts` | 6 mock agents, upvotes, comments for local development |
| `src/utils/agentUtils.ts` | Filter and sort agents |
| `src/utils/avatarUtils.ts` | Initials generation and color hashing |
| `src/utils/upvoteUtils.ts` | Toggle, check, count upvotes |
| `src/utils/commentUtils.ts` | Add and filter comments |
| `src/generated/` | Auto-generated Dataverse models and services (do not edit) |

## Theme

Light theme only. CSS custom properties defined in `src/index.css` `:root` block. Uses Fluent Design color palette. No dark theme, no localStorage persistence.

## Testing

Vitest + React Testing Library + jsdom. Separate `vitest.config.ts` (uses `react()` plugin only — `powerApps()` breaks jsdom).

```bash
npm test           # vitest run (CI mode)
```

97 tests covering utilities, Dataverse service layer, and all components.
