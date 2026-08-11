export type ReleaseCardInput = {
  project: string;
  version: string;
  tag?: string | null;
  repository: string;
  releaseUrl?: string | null;
  workflowUrl?: string | null;
  channel: string;
};

export function buildReleaseCard(input: ReleaseCardInput) {
  const lines = [
    `**${input.project} 发布完成**`,
    `版本：${input.version}`,
  ];

  if (input.tag) lines.push(`Tag：${input.tag}`);
  lines.push(`仓库：${input.repository}`);
  if (input.releaseUrl) lines.push(`Release：${input.releaseUrl}`);
  if (input.workflowUrl) lines.push(`Workflow：${input.workflowUrl}`);
  lines.push(`通道：${input.channel}`);

  return lines.join("\n");
}
