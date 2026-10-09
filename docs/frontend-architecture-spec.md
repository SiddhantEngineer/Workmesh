# Workmesh Frontend Architecture Specification

**Status:** Approved & Implemented  
**Scope:** `apps/web` (Next.js 15 App Router, React 19, TanStack Query v5)  
**Reference Design System:** [Minimal Design System](file:///d:/Projects/Workmesh/docs/ui-design-spec.md)

---

## 1. Architectural Principles

1. **Zero Raw Inline Fetch Calls:**  
   UI components must never execute raw `fetch("/api/...")` calls with manual headers, JSON serialization, and repeated `try/catch` boilerplate.
2. **Centralized Typed API Client (`src/lib/api-client.ts`):**  
   All HTTP requests pass through the centralized `apiClient`. It automatically unwraps `{ data: T }` responses from Hono and throws strongly-typed `ApiClientError` instances on non-2xx responses.
3. **TanStack Query for Server State:**  
   Server data caching, refetching, background synchronization, and mutations are exclusively managed via TanStack Query (`useQuery` and `useMutation`).
4. **Feature Colocation (No Premature Folders):**  
   Code is organized by active feature domains inside `src/features/<feature>/` (containing `api.ts`, `queries.ts`, and `components/`). Folders are only created as features are actively implemented.
5. **Route-Driven Navigation:**  
   Project boards are deep-linkable via project key slugs (e.g. `/projects/WM`), while the root (`/`) serves as the Projects Directory / Overview dashboard.
6. **Route-Driven Detail Pages & Scoped Modals:**  
   Detailed inspections live on dedicated URLs (`/projects/[key]/features/[featureKey]` and `/projects/[key]/bugs/[bugKey]`), supporting full screen space, browser history, and deep-linking. Modals are strictly reserved for fast transactional creation (`+ New Project`, `+ Propose Feature`, `+ Report Bug`).
7. **Silent Real-Time Sync (Epic 06 SSE):**  
   Incoming Server-Sent Events from backend agents trigger `queryClient.invalidateQueries(...)` to silently and smoothly refetch fresh board data without noisy toasts or ticker banners.

---

## 2. Directory Layout

```text
apps/web/src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout with Fonts, Theme script, and Providers
│   ├── providers.tsx                 # Client-side QueryClientProvider
│   ├── globals.css                   # Minimal design tokens (surface, text, borders, fonts)
│   ├── page.tsx                      # Projects Directory / Overview dashboard
│   └── projects/                     # Route-driven project hierarchy
│       └── [key]/
│           ├── page.tsx              # Project Hub (Kanban Board & Epics/Features List)
│           ├── features/
│           │   └── [featureKey]/
│           │       └── page.tsx      # Feature Detail Page (Criteria checklist, bugs, action rail)
│           └── bugs/
│               └── [bugKey]/
│                   └── page.tsx      # Bug Detail Page (Repro steps, resolution, parent link)
├── features/                         # Feature modules (only created when implemented)
│   ├── projects/                     # Project management domain
│   ├── features/                     # Feature tickets domain (Kanban cards, criteria, details)
│   └── bugs/                         # Bug tickets domain (Bug cards, repro inputs, resolve)
├── components/                       # Shared / generic UI components
│   ├── layout/
│   │   └── TopNav.tsx                # Minimal 48px header navigation
│   ├── ui/
│   │   └── Modal.tsx                 # Creation-only dialog (Escape key, scroll lock, backdrop)
│   └── ThemeToggle.tsx
```
│   ├── layout/
│   │   └── TopNav.tsx                # Minimal 48px header navigation
│   ├── ui/
│   │   └── Modal.tsx                 # Focus-heavy centered dialog (Escape key, scroll lock, backdrop)
│   └── ThemeToggle.tsx
├── lib/                              # Core singletons and utilities
    ├── api-client.ts                 # Base fetch wrapper & ApiClientError
    └── query-client.ts               # QueryClient factory & default options
```

---

## 3. Data Flow & Patterns

### 3.1 Base API Client (`src/lib/api-client.ts`)
```ts
import { apiClient } from "@/lib/api-client";

// GET request (automatically unwraps { data: T } from Hono)
const projects = await apiClient.get<Project[]>("/api/projects");

// POST request (automatically sets Content-Type: application/json)
const newProject = await apiClient.post<Project>("/api/projects", payload);
```

### 3.2 Query Keys Factory Pattern (`src/features/<feature>/queries.ts`)
Each feature declares a query key factory to guarantee deterministic and type-safe cache keys:
```ts
export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: number) => [...projectKeys.all, "detail", id] as const,
};
```

### 3.3 Mutation Cache Invalidation
Mutations automatically invalidate relevant query keys on success:
```ts
export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => projectsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
```

### 3.4 Future SSE Integration (Epic 06)
When an agent shifts a card status via MCP or a webhook arrives via SSE:
```ts
sse.on("TICKET_UPDATED", () => {
  queryClient.invalidateQueries({ queryKey: ticketKeys.byProject(currentProjectKey) });
});
```
TanStack Query silently refetches the board in the background, smoothly transitioning the card in accordance with the Minimal Design System's "Silent Real-Time Sync" spec.
