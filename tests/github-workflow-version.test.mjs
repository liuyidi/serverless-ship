import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("workflow_run notifications use branch and sha for version", () => {
  const sourcePath = resolve("lib/github-webhook.ts");
  const source = readFileSync(sourcePath, "utf8");

  assert.ok(
    source.includes("formatWorkflowVersion"),
    "expected workflow version formatting helper to exist",
  );
  assert.ok(
    source.includes("return `${branch}-${sha}`;"),
    "expected workflow version to combine branch and sha",
  );
  assert.ok(
    source.includes("head_sha?: string;"),
    "expected workflow_run payload type to include head_sha",
  );
});
