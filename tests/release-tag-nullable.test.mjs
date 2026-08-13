import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("release tags are nullable in the base migration", () => {
  const migrationPath = resolve("supabase/migrations/20260812000000_init_serverlessship.sql");
  const migration = readFileSync(migrationPath, "utf8");

  assert.ok(
    migration.includes("tag text"),
    "expected releases.tag to be declared in the base migration",
  );
  assert.ok(
    !migration.includes("tag text not null"),
    "expected releases.tag to be nullable in the base migration",
  );
});
