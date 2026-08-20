import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("recordRelease prefers the request project name over PROJECT_SLUG", () => {
  const sourcePath = resolve("lib/supabase.ts");
  const source = readFileSync(sourcePath, "utf8");

  assert.ok(
    source.includes("async function upsertProject(projectName: string, repository: string, slug: string)"),
    "expected project name, repository, and slug to be passed into the project upsert helper",
  );
  assert.ok(
    source.includes("on_conflict=slug"),
    "expected projects to be upserted by slug",
  );
  assert.ok(
    source.includes("name: projectName"),
    "expected project name to come from the request project name",
  );
  assert.ok(
    source.includes("const slug = normalizeSlug(repository, projectSlug);"),
    "expected project slug to be derived from the repository identity with a fallback override",
  );
  assert.ok(
    source.includes("const repository = input.repository.trim() || config.githubRepository;"),
    "expected request repository to fall back to GITHUB_REPOSITORY when missing",
  );
});
