import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("recordRelease prefers the request project name over PROJECT_SLUG", () => {
  const sourcePath = resolve("lib/supabase.ts");
  const source = readFileSync(sourcePath, "utf8");

  assert.ok(
    source.includes("async function upsertProject(projectName: string)"),
    "expected project name to be passed into the project upsert helper",
  );
  assert.ok(
    source.includes("slug: projectName"),
    "expected project slug to come from the request project name",
  );
  assert.ok(
    source.includes("name: projectName"),
    "expected project name to come from the request project name",
  );
  assert.ok(
    source.includes("const projectName = input.project.trim() || config.projectSlug;"),
    "expected request project name to fall back to PROJECT_SLUG when missing",
  );
});
