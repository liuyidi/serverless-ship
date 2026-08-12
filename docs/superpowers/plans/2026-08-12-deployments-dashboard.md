# Deployments Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only deployments dashboard that lists all deployment records across projects with filtering, pagination, and outbound links.

**Architecture:** The dashboard is a server-rendered list page backed by Supabase. The existing `releases` and `deliveries` data remains the source of truth, with a small schema adjustment to make channel filtering first-class. The page reads filters from the URL, renders a paginated table, and uses linked actions for GitHub Release, workflow, and ServerlessShip record views.

**Tech Stack:** Next.js App Router, TypeScript, Supabase REST via existing server helpers, plain server components, shadcn/ui-style table and filter controls, Lucide icons.

## Global Constraints

- Keep the current bilingual site behavior intact.
- Preserve the existing homepage and flow visualization routes.
- Default sort order for the dashboard is newest release first.
- Pagination is fixed at 20 rows per page.
- Filters must be reflected in the URL so the page is shareable.
- The dashboard is read-only; it must not add edit or delete actions.
- Row actions should link out to the underlying GitHub Release, workflow, and ServerlessShip detail views when available.
- Prefer small, focused files that mirror the existing codebase patterns.

---

### Task 1: Extend the data model for dashboard filtering

**Files:**
- Modify: `supabase/migrations/20260812000000_init_serverlessship.sql`
- Modify: `lib/supabase.ts`
- Modify: `app/api/releases/route.ts`
- Modify: `docs/deployment.md`
- Modify: `docs/notes/serverlessship.md`

**Interfaces:**
- Consumes: `ReleaseCardInput` from `lib/card.ts`
- Produces: a `channel` column stored on `public.releases` and written by the release ingestion path

- [ ] **Step 1: Write the failing test**

Add a minimal schema/query expectation to the existing Supabase-facing tests or a new unit test for the release payload mapping that asserts `channel` is persisted alongside `version`, `tag`, and `status`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test` or the narrowest existing test command for the Supabase helper
Expected: failure because `channel` is not yet part of the stored payload/schema mapping.

- [ ] **Step 3: Write minimal implementation**

Update the migration to add a non-null `channel text` column to `public.releases`, and include `channel: input.channel` in the `recordRelease` insert payload.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test` or the narrowest existing test command for the Supabase helper
Expected: pass with the new `channel` field flowing through.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260812000000_init_serverlessship.sql lib/supabase.ts app/api/releases/route.ts docs/deployment.md docs/notes/serverlessship.md
git commit -m "Add channel to release records"
```

### Task 2: Add a dashboard data loader and listing route

**Files:**
- Create: `lib/deployments.ts`
- Create: `app/api/deployments/route.ts`
- Create: `app/deployments/page.tsx`
- Modify: `app/page.tsx`
- Modify: `lib/i18n.ts`

**Interfaces:**
- Consumes: Supabase REST helpers from `lib/supabase.ts`
- Produces: a list API returning paginated deployment rows and a dashboard route at `/deployments`

- [ ] **Step 1: Write the failing test**

Add a unit test for a new `buildDeploymentQuery` or equivalent helper that assembles filters from `project`, `channel`, `status`, `q`, `from`, `to`, `page`, and `pageSize`, and asserts newest-first ordering.

- [ ] **Step 2: Run test to verify it fails**

Run: the new helper test
Expected: failure because the helper does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create `lib/deployments.ts` with a query helper that joins `projects`, `releases`, and `deliveries`, applies URL-driven filters, and returns total count plus 20-row pages. Expose an API route that serializes the result for the page.

- [ ] **Step 4: Run test to verify it passes**

Run: the new helper test and any smoke test for `/api/deployments`
Expected: pass and return data sorted by `created_at desc`.

- [ ] **Step 5: Commit**

```bash
git add lib/deployments.ts app/api/deployments/route.ts app/deployments/page.tsx app/page.tsx lib/i18n.ts
git commit -m "Add deployments dashboard route"
```

### Task 3: Build the dashboard table UI with filters and pagination

**Files:**
- Create: `components/deployments/deployments-table.tsx`
- Create: `components/deployments/deployments-filters.tsx`
- Modify: `app/deployments/page.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: paginated deployment data and URL search params
- Produces: a responsive table with project, channel, status, version/tag, timestamps, and action links

- [ ] **Step 1: Write the failing test**

Add a React test for the table view that verifies the header filters render, the empty state is shown when no rows exist, and the pagination controls render when `total > 20`.

- [ ] **Step 2: Run test to verify it fails**

Run: the new component test
Expected: failure because the component does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Implement the filters and table using the existing shadcn-style visual language, keeping the layout simple and readable. Each row should link out to GitHub Release, workflow, and ServerlessShip detail URLs when present.

- [ ] **Step 4: Run test to verify it passes**

Run: the new component test
Expected: pass with filters, rows, and pagination visible.

- [ ] **Step 5: Commit**

```bash
git add components/deployments/deployments-table.tsx components/deployments/deployments-filters.tsx app/deployments/page.tsx app/globals.css
git commit -m "Add deployments dashboard UI"
```

### Task 4: Wire navigation, docs, and verification

**Files:**
- Modify: `app/layout.tsx` or site navigation file if present
- Modify: `README.md`
- Modify: `docs/deployment.md`
- Modify: `docs/notes/serverlessship.md`
- Modify: `app/api/supabase/status/route.ts` if needed for status links

**Interfaces:**
- Consumes: the new `/deployments` route
- Produces: discoverable navigation and updated docs

- [ ] **Step 1: Write the failing test**

Add a small route-level or snapshot test that asserts the dashboard link is exposed from the homepage or navigation.

- [ ] **Step 2: Run test to verify it fails**

Run: the new route/navigation test
Expected: failure until the dashboard link is added.

- [ ] **Step 3: Write minimal implementation**

Add a visible link to `/deployments`, document the page in README/deployment notes, and verify the dashboard works with real Supabase records in the browser.

- [ ] **Step 4: Run test to verify it passes**

Run: the new route/navigation test plus a local smoke check against `/deployments`
Expected: pass and render the table.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx README.md docs/deployment.md docs/notes/serverlessship.md app/api/supabase/status/route.ts
git commit -m "Document deployments dashboard"
```
