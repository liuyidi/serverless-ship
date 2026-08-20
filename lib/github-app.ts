import crypto from "node:crypto";
import sodium from "libsodium-wrappers";
import { getEnv } from "@/lib/env";

const API = "https://api.github.com";

function githubAppPrivateKey() {
  const value = getEnv().githubAppPrivateKey;
  if (!value) throw new Error("GITHUB_APP_PRIVATE_KEY is not configured");

  const unquoted = value.trim().replace(/^(['"])(.*)\1$/, "$2");
  const pem = unquoted.replace(/\\n/g, "\n");
  const decoded = Buffer.from(pem, "base64").toString("utf8").trim();
  const key = pem.includes("-----BEGIN") ? pem : decoded;

  try {
    return crypto.createPrivateKey({ key, format: "pem" });
  } catch {
    throw new Error("GITHUB_APP_PRIVATE_KEY must be a GitHub App PEM private key, with literal newlines, escaped \\n characters, or Base64-encoded PEM content");
  }
}

function appJwt() {
  const env = getEnv();
  if (!env.githubAppId) throw new Error("GITHUB_APP_ID is not configured");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iat: now - 60, exp: now + 540, iss: env.githubAppId })}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(githubAppPrivateKey()).toString("base64url")}`;
}

async function installationToken() {
  const installationId = getEnv().githubAppInstallationId;
  if (!installationId) throw new Error("GITHUB_APP_INSTALLATION_ID is not configured");
  const response = await fetch(`${API}/app/installations/${installationId}/access_tokens`, { method: "POST", headers: { Authorization: `Bearer ${appJwt()}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" } });
  if (!response.ok) throw new Error(`GitHub installation token failed: ${response.status}`);
  return ((await response.json()) as { token: string }).token;
}

async function github(path: string, init: RequestInit = {}) {
  const token = await installationToken();
  const response = await fetch(`${API}${path}`, { ...init, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", ...init.headers } });
  return response;
}

function repositoryParts(repository: string) {
  const [owner, repo, ...extra] = repository.trim().split("/");
  if (!owner || !repo || extra.length) throw new Error("repository must be owner/name");
  return { owner, repo };
}

export function notificationSecretName(slug: string) {
  return `SERVERLESSSHIP_TOKEN_${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
}

export function notificationWorkflow(slug: string, projectName: string, channel: string) {
  const serviceUrl = `${getEnv().appBaseUrl.replace(/\/$/, "")}/api/releases`;
  const secretName = notificationSecretName(slug);
  const payload = JSON.stringify({
    project: projectName,
    version: "${{ github.event.release.tag_name }}",
    tag: "${{ github.event.release.tag_name }}",
    repository: "${{ github.repository }}",
    releaseUrl: "${{ github.event.release.html_url }}",
    workflowUrl: "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}",
    channel,
  });
  const encodedPayload = Buffer.from(payload).toString("base64");

  return `name: ${JSON.stringify(`ServerlessShip - ${projectName}`)}\n\non:\n  release:\n    types: [published]\n\npermissions:\n  contents: read\n\njobs:\n  notify:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Notify ServerlessShip\n        env:\n          SERVERLESSSHIP_URL: ${JSON.stringify(serviceUrl)}\n          SERVERLESSSHIP_TOKEN: \${{ secrets.${secretName} || secrets.SERVERLESSSHIP_TOKEN }}\n          SERVERLESSSHIP_PAYLOAD: ${encodedPayload}\n        run: |\n          curl --fail-with-body -X POST \"$SERVERLESSSHIP_URL\" \\\n            -H \"Authorization: Bearer $SERVERLESSSHIP_TOKEN\" \\\n            -H \"Content-Type: application/json\" \\\n            --data-raw \"$(printf '%s' \"$SERVERLESSSHIP_PAYLOAD\" | base64 --decode)\"\n`;
}

export async function connectGithubProject(input: { repository: string; slug: string; projectName: string; channel: string; notifyToken: string }) {
  const { owner, repo } = repositoryParts(input.repository);
  const publicKey = await github(`/repos/${owner}/${repo}/actions/secrets/public-key`);
  if (!publicKey.ok) throw new Error(`GitHub Actions secrets unavailable: ${publicKey.status}`);
  const key = (await publicKey.json()) as { key_id: string; key: string };
  await sodium.ready;
  const encrypted = sodium.to_base64(sodium.crypto_box_seal(input.notifyToken, sodium.from_base64(key.key, sodium.base64_variants.ORIGINAL)), sodium.base64_variants.ORIGINAL);
  const secretName = notificationSecretName(input.slug);
  const secret = await github(`/repos/${owner}/${repo}/actions/secrets/${secretName}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ encrypted_value: encrypted, key_id: key.key_id }) });
  if (!secret.ok) throw new Error(`GitHub secret write failed: ${secret.status}`);

  const path = `.github/workflows/serverless-ship-${input.slug}.yml`;
  const existing = await github(`/repos/${owner}/${repo}/contents/${path}`);
  let sha: string | undefined;
  if (existing.ok) sha = ((await existing.json()) as { sha: string }).sha;
  else if (existing.status !== 404) throw new Error(`GitHub workflow read failed: ${existing.status}`);
  const workflow = await github(`/repos/${owner}/${repo}/contents/${path}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ message: `${sha ? "Update" : "Add"} ServerlessShip notification for ${input.projectName}`, content: Buffer.from(notificationWorkflow(input.slug, input.projectName, input.channel)).toString("base64"), ...(sha ? { sha } : {}) }) });
  if (!workflow.ok) throw new Error(`GitHub workflow write failed: ${workflow.status}`);
  return { secretName, workflowPath: path };
}
