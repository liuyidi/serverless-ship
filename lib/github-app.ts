import crypto from "node:crypto";
import sodium from "libsodium-wrappers";
import { getEnv } from "@/lib/env";

const API = "https://api.github.com";

function appJwt() {
  const env = getEnv();
  if (!env.githubAppId || !env.githubAppPrivateKey) throw new Error("GitHub App is not configured");
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const unsigned = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iat: now - 60, exp: now + 540, iss: env.githubAppId })}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${signer.sign(env.githubAppPrivateKey.replace(/\\n/g, "\n")).toString("base64url")}`;
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
  const [owner, repo, ...extra] = repository.split("/");
  if (!owner || !repo || extra.length) throw new Error("repository must be owner/name");
  return { owner, repo };
}

export function notificationWorkflow(slug: string, projectName: string, channel: string) {
  return `name: ServerlessShip - ${projectName}\n\non:\n  release:\n    types: [published]\n\npermissions:\n  contents: read\n\njobs:\n  notify:\n    runs-on: ubuntu-latest\n    steps:\n      - name: Notify ServerlessShip\n        env:\n          SERVERLESSSHIP_URL: https://serverless-ship.liuyidi.me\n          SERVERLESSSHIP_TOKEN: \${{ secrets.SERVERLESSSHIP_TOKEN_${slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")} }}\n        run: |\n          curl --fail-with-body -X POST "$SERVERLESSSHIP_URL/api/releases" \\\n            -H "Authorization: Bearer $SERVERLESSSHIP_TOKEN" \\\n            -H "Content-Type: application/json" \\\n            -d '{"project":"${projectName}","version":"\${{ github.event.release.tag_name }}","tag":"\${{ github.event.release.tag_name }}","repository":"\${{ github.repository }}","releaseUrl":"\${{ github.event.release.html_url }}","workflowUrl":"\${{ github.server_url }}/\${{ github.repository }}/actions/runs/\${{ github.run_id }}","channel":"${channel}"}'\n`;
}

export async function connectGithubProject(input: { repository: string; slug: string; projectName: string; channel: string; notifyToken: string }) {
  const { owner, repo } = repositoryParts(input.repository);
  const publicKey = await github(`/repos/${owner}/${repo}/actions/secrets/public-key`);
  if (!publicKey.ok) throw new Error(`GitHub Actions secrets unavailable: ${publicKey.status}`);
  const key = (await publicKey.json()) as { key_id: string; key: string };
  await sodium.ready;
  const encrypted = sodium.to_base64(sodium.crypto_box_seal(input.notifyToken, sodium.from_base64(key.key, sodium.base64_variants.ORIGINAL)), sodium.base64_variants.ORIGINAL);
  const secretName = `SERVERLESSSHIP_TOKEN_${input.slug.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
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
