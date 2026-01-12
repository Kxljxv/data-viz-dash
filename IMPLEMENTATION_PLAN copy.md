# AEA Platform Implementation Plan

This document details the step-by-step implementation plan for the features and improvements outlined in `ROADMAP.md`.

---

## 🟢 Phase 1: Short Term

### 1. TypeScript Migration
**Goal**: Convert core logic to TypeScript for better type safety.
- [ ] **Setup**: Create `tsconfig.json` extending `@sveltejs/kit/tsconfig.json`.
- [ ] **Type Definitions**: Create `src/types.ts` for shared interfaces (Node, Link, Motion).
- [ ] **Component Migration**: Add `<script lang="ts">` to key Svelte components.
- [ ] **Logic Migration**: Rename `GraphVisualization.js` to `.ts` and add type annotations for D3 objects.
- [ ] **Strict Mode**: Enable `strict: true` in `tsconfig.json` iteratively.

### 2. Zustand Integration
**Goal**: Replace ad-hoc Svelte stores/runes with a robust global state manager.
- [ ] **Install**: Add `zustand` and `svelte-zustand` (if available) or create a wrapper.
- [ ] **Store Design**: Define slices for `GraphState` (nodes, links), `UIState` (panels, modals), and `SessionState` (user, preferences).
- [ ] **Migration**: Refactor `ControlPanel.svelte` and `GraphVisualization.js` to consume the new store.

### 3. Axios Migration
**Goal**: Standardize HTTP requests.
- [ ] **Install**: Add `axios`.
- [ ] **Client Setup**: Create `src/lib/api/client.ts` with base URL and interceptors.
- [ ] **Auth Interceptor**: Automatically attach Bearer tokens from Auth0.
- [ ] **Error Handling**: Centralize error logging and toast notifications.
- [ ] **Replace Fetch**: Update all `fetch()` calls in `+page.svelte` and `+server.js` files.

### 4. Unit Testing
**Goal**: Ensure component reliability.
- [ ] **Setup**: Verify `vitest` configuration.
- [ ] **Component Tests**: Write tests for `Button.svelte`, `DetailPanel.svelte` (render, event dispatch).
- [ ] **Logic Tests**: Test `GraphVisualization` math helpers (force simulation parameters).
- [ ] **Integration**: Test the data flow from `loadData()` to rendering.

### 5. Density Analysis Speed
**Goal**: Improve UI responsiveness during heavy calculations.
- [ ] **Web Worker**: Move the O(N) node matching logic from `+page.svelte` to a Web Worker.
- [ ] **OffscreenCanvas**: Investigate rendering density contours in a worker (advanced).
- [ ] **Progress Feedback**: Show a granular progress bar during the worker task.

### 6. Group Synchronization (Cloudflare KV)
**Goal**: Persist user groups across devices.
- [ ] **API Endpoint**: Create `POST /api/groups` and `GET /api/groups`.
- [ ] **KV Schema**: Define key structure `groups:${userId}`.
- [ ] **Frontend**: Update `GroupsTab.svelte` to fetch/save groups on mount/change.
- [ ] **Conflict Resolution**: Simple "last write wins" or merge strategy.

---

## 🟡 Phase 2: Medium Term 

### 7. Web Usage Analytics
**Goal**: Admin dashboard for usage stats.
- [ ] **Data Collection**: Middleware/Hooks (`handle`) to log request paths, timestamps, and user agents to Cloudflare Analytics Engine or KV.
- [ ] **Admin Route**: Create `/admin/analytics` (protected by role).
- [ ] **Visualization**: Use `Chart.js` or `Recharts` to show page views over time.

### 8. Centrality Measures
**Goal**: Identify key influencers.
- [ ] **Algorithms**: Implement Dijkstra (for Betweenness) or use `graphology` library.
- [ ] **UI Integration**: Add "Color by Centrality" option in `ControlPanel`.

### 9. Interactive Storytelling
- [ ] **Story Model**: Define JSON schema for a "Tour" (sequence of node IDs + text).
- [ ] **Player UI**: Overlay component with "Next/Prev" buttons and text description.
- [ ] **Camera Control**: Smoothly animate camera to the target node for each step.

### 10. Annotations
- [ ] **Data Model**: `Annotation { targetId: string, text: string, author: string }`.
- [ ] **UI**: "Add Note" context menu action.
- [ ] **Display**: Small badge on annotated nodes.

---

## 🟠 Phase 3:

### 11. Real-time Collaboration
- [ ] **Backend**: Setup Cloudflare Durable Objects for WebSocket state.
- [ ] **CRDT**: Use `Y.js` to sync graph state (selection, position) in real-time.
- [ ] **Cursors**: Show other users' cursors on the canvas.

...and more.
