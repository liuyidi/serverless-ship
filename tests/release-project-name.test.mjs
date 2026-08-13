import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("recordRelease prefers the request project name over PROJECT_SLUG", () => {
  const sourcePath = resolve("lib/supabase.ts");
  const source = readFileSync(sourcePath, "utf8");

  assert.ok(
    source.includes("async function upsertProject(projectName: string, repository: string)"),
    "expected project name and repository to be passed into the project upsert helper",
  );
  assert.ok(
    source.includes("on_conflict=repository"),
    "expected projects to be upserted by repository",
  );
  assert.ok(
    source.includes("name: projectName"),
    "expected project name to come from the request project name",
  );
  assert.ok(
    source.includes("repository = input.repository.trim() || config.githubRepository;"),
    "expected request repository to fall back to GITHUB_REPOSITORY when missing",
  );
});
