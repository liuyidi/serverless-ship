# ServerlessShip Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the ServerlessShip landing page into a bilingual, architecture-first homepage that explains the end-to-end deployment loop and the API surface clearly.

**Architecture:** Keep the app as a single Next.js page, but restructure the homepage into a stronger hierarchy: hero, compact language switch, flow-map/architecture section, API module section, and supporting stack notes. Use the existing global stylesheet for all visual treatment so the implementation stays small and focused.

**Tech Stack:** Next.js App Router, React 19, TypeScript, plain CSS in `app/globals.css`, Vercel-hosted deployment.

## Global Constraints

- Preserve the current Next.js App Router structure.
- Keep the homepage fully static on first render.
- Support both Chinese and English copy in the landing page.
- Make the architecture flow read like a system diagram, not a decorative illustration.
- Keep the language switch subtle and compact.
- Surface the serverless chain end to end: user, GitHub, GitHub Actions, ServerlessShip, Supabase, Feishu, and the message card result.

---

### Task 1: Rebuild the homepage structure

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: static section data arrays and bilingual copy blocks.
- Produces: a single homepage component with a bilingual hero, architecture flow section, API/module cards, and compact utility links.

- [ ] **Step 1: Rewrite the homepage into clear sections**

```tsx
export default function HomePage() {
  return (
    <main>
      {/* hero */}
      {/* compact language switch */}
      {/* architecture flow */}
      {/* api surface */}
      {/* module/stack cards */}
    </main>
  );
}
```

- [ ] **Step 2: Add bilingual content blocks**

```tsx
const copy = {
  zh: { /* hero, labels, descriptions */ },
  en: { /* hero, labels, descriptions */ },
};
```

- [ ] **Step 3: Update metadata for the new positioning**

```tsx
export const metadata: Metadata = {
  title: "ServerlessShip",
  description: "Serverless Feishu deploy notifier for minibot with a bilingual architecture-first homepage.",
};
```

- [ ] **Step 4: Verify the page compiles**

Run: `npm run build`
Expected: Next.js build completes without type or JSX errors.

### Task 2: Replace the global styling with an architecture-first visual system

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: section class names from `app/page.tsx`.
- Produces: layout, typography, card, chip, and flow-map styles that render correctly on desktop and mobile.

- [ ] **Step 1: Define the visual tokens**

```css
:root {
  --bg: ...;
  --panel: ...;
  --text: ...;
  --muted: ...;
  --accent: ...;
}
```

- [ ] **Step 2: Add section and card layouts**

```css
.hero, .sectionCard, .flowPanel, .apiGrid, .moduleGrid { ... }
```

- [ ] **Step 3: Add the compact language switch and architecture flow styles**

```css
.langSwitch { ... }
.flowStage { ... }
.flowArrow { ... }
```

- [ ] **Step 4: Add responsive adjustments**

```css
@media (max-width: 820px) {
  .gridTwo { grid-template-columns: 1fr; }
  .flowStage { min-width: 0; }
}
```

- [ ] **Step 5: Verify mobile and desktop layout**

Run: `npm run build`
Expected: CSS classes compile and the page remains responsive.

### Task 3: Refresh README with the new homepage and deployment story

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: final homepage messaging and deployment details.
- Produces: a concise project README that matches the new product framing.

- [ ] **Step 1: Update the introduction**

```md
ServerlessShip is a bilingual, serverless deployment notifier for minibot.
```

- [ ] **Step 2: Add the homepage and API surface summary**

```md
- `/` landing page
- `/api/health`
- `/api/releases`
- `/api/webhooks/github`
```

- [ ] **Step 3: Document the Vercel/Supabase deployment posture**

```md
Deploy on Vercel Hobby and store state in Supabase Free.
```

- [ ] **Step 4: Verify the README still matches the app**

Run: `git diff -- README.md`
Expected: README reflects the live app positioning and routes.

### Task 4: Visual verification

**Files:**
- None

**Interfaces:**
- Consumes: the built app at `http://localhost:3000`.
- Produces: confirmed visual alignment with the approved flow-map direction.

- [ ] **Step 1: Start the app locally**

Run: `npm run dev`
Expected: Next.js serves the homepage locally.

- [ ] **Step 2: Inspect the homepage in the browser**

Open the local site and verify:
- the language toggle is small and subtle
- the flow map reads left to right with a clear loop back
- the API cards and modules are readable

- [ ] **Step 3: Fix any visual regressions**

If the page wraps awkwardly or the flow loses clarity, adjust only `app/page.tsx` and `app/globals.css`.

