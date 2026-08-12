# Admin Deployments Console Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move deployments into `/admin/deployments` and redesign the page as a shadcn-style admin console distinct from the marketing homepage.

**Architecture:** Keep the deployments data source and API intact, but relocate the UI into an `app/admin` route group with an admin shell and dedicated console styling. Preserve the old `/deployments` route as a redirect so existing links keep working while the new admin route becomes canonical.

**Tech Stack:** Next.js App Router, TypeScript, Supabase REST, CSS modules/global CSS, Lucide icons.

## Global Constraints

- The admin console must live under `app/admin`.
- The canonical deployments route is `/admin/deployments`.
- The public landing page must remain visually distinct from the admin console.
- Existing `/deployments` links should continue to work via redirect.
- Keep the deployments page read-only.
- Preserve the current deployment data model and API behavior.

---

### Task 1: Add the admin route shell and move deployments into it

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/admin/deployments/page.tsx`
- Create: `app/admin/deployments/[id]/page.tsx`
- Modify: `app/deployments/page.tsx`
- Modify: `app/deployments/[id]/page.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `listDeployments`, `getDeploymentById`, and the existing homepage CTA links.
- Produces: `/admin` and `/admin/deployments` routes, with old routes redirecting to the new canonical paths.

- [ ] **Step 1: Write the route-move implementation**

Create the new `app/admin` route group and move the deployments page content into it. Make the old `/deployments` pages return redirects to `/admin/deployments`.

- [ ] **Step 2: Verify route resolution**

Run a local request against both `/deployments` and `/admin/deployments`.
Expected: `/deployments` responds with a redirect and `/admin/deployments` serves the page.

- [ ] **Step 3: Update homepage navigation**

Point the public landing page CTA at `/admin/deployments` so the marketing page and admin console are clearly separated.

- [ ] **Step 4: Commit**

```bash
git add app/admin app/deployments/page.tsx app/deployments/[id]/page.tsx app/page.tsx
git commit -m "Move deployments into admin route"
```

### Task 2: Redesign the console UI in shadcn/admin style

**Files:**
- Modify: `app/globals.css`
- Modify: `app/admin/deployments/page.tsx`
- Modify: `app/admin/deployments/[id]/page.tsx`
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: redirected admin routes and deployment list/detail data.
- Produces: an admin console layout with sidebar navigation, a compact top bar, cards, stat tiles, filters, and dense tables.

- [ ] **Step 1: Write the console layout**

Implement an admin shell with a left rail, top bar, section headers, and card-based summary blocks that feel like a control panel rather than the public site.

- [ ] **Step 2: Restyle the deployments list and detail views**

Update the list and detail pages to use the new console layout, tighter spacing, muted surfaces, and shadcn-style controls.

- [ ] **Step 3: Verify visually**

Open `/admin/deployments` in the browser and compare the result against the public homepage.
Expected: the admin page reads like a console and no longer resembles the landing page.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/admin/page.tsx app/admin/deployments/page.tsx app/admin/deployments/[id]/page.tsx
git commit -m "Restyle deployments as admin console"
```

### Task 3: Verify and clean up legacy links

**Files:**
- Modify: any remaining links pointing to `/deployments`
- Modify: docs or notes only if they mention the old public path

**Interfaces:**
- Consumes: the new canonical admin route.
- Produces: consistent routing and updated references.

- [ ] **Step 1: Search for old links**

Find remaining `/deployments` references in the app and docs.

- [ ] **Step 2: Update stale references**

Replace user-facing links with `/admin/deployments` while keeping redirects for compatibility.

- [ ] **Step 3: Run verification**

Run `npm run typecheck` and smoke test the admin page in the browser.
Expected: no type errors and the admin console loads cleanly.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "Finalize admin deployments routing"
```
