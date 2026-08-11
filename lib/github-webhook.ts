import crypto from "node:crypto";
import { getEnv } from "@/lib/env";
import type { ReleaseCardInput } from "@/lib/card";

export type GithubReleaseEvent = {
  action?: string;
  release?: {
    tag_name?: string;
    html_url?: string;
    prerelease?: boolean;
  };
  repository?: {
    full_name?: string;
    html_url?: string;
  };
  workflow_run?: {
    html_url?: string;
    conclusion?: string;
    name?: string;
    head_branch?: string;
  };
};

export function verifyGithubSignature(body: string, signature256: string | null) {
  const secret = getEnv().githubWebhookSecret;
  if (!secret) return true;
  if (!signature256?.startsWith("sha256=")) return false;

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const received = signature256.slice("sha256=".length);

  if (expected.length !== received.length) return false;

  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
}

export function toReleaseNotification(event: GithubReleaseEvent): ReleaseCardInput | null {
  const release = event.release;
  const repository = event.repository?.full_name ?? getEnv().githubRepository;

  if (release?.tag_name) {
    return {
      project: getEnv().projectSlug,
      version: release.tag_name,
      tag: release.tag_name,
      repository,
      releaseUrl: release.html_url ?? null,
      workflowUrl: event.workflow_run?.html_url ?? null,
      channel: "GitHub Release",
    };
  }

  const workflowRun = event.workflow_run;
  if (!workflowRun || workflowRun.conclusion !== "success") {
    return null;
  }

  const workflowName = workflowRun.name ?? workflowRun.head_branch ?? "GitHub workflow";

  return {
    project: getEnv().projectSlug,
    version: workflowName,
    tag: null,
    repository,
    releaseUrl: null,
    workflowUrl: workflowRun.html_url ?? null,
    channel: "GitHub Workflow",
  };
}
