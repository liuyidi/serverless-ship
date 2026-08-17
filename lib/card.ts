export type ReleaseCardInput = {
  project: string;
  version: string;
  tag?: string | null;
  repository: string;
  releaseUrl?: string | null;
  workflowUrl?: string | null;
  channel: string;
};

type CardTemplate = { preset?: "ember" | "ocean" | "mono"; title?: string; signature?: string; showVersion?: boolean; showChannel?: boolean; showLinks?: boolean };

export function buildReleaseCard(input: ReleaseCardInput, template?: CardTemplate) {
  const lines = [
    `**${template?.title || `${input.project} 发布完成`}**`,
  ];

  if (template?.showVersion !== false) lines.push(`版本：${input.version}`);

  if (template?.showVersion !== false && input.tag) lines.push(`Tag：${input.tag}`);
  lines.push(`仓库：${input.repository}`);
  if (template?.showLinks !== false && input.releaseUrl) lines.push(`Release：${input.releaseUrl}`);
  if (template?.showLinks !== false && input.workflowUrl) lines.push(`Workflow：${input.workflowUrl}`);
  if (template?.showChannel !== false) lines.push(`通道：${input.channel}`);
  if (template?.signature) lines.push(`\n${template.signature}`);

  return lines.join("\n");
}

export function buildFeishuInteractiveCard(input: ReleaseCardInput, template?: CardTemplate) {
  const title = template?.title || `${input.project} 发布完成`;
  const lines: string[] = [];
  if (template?.showVersion !== false) lines.push(`**版本**：${input.version}`);

  if (template?.showVersion !== false && input.tag) lines.push(`**Tag**：${input.tag}`);
  lines.push(`**仓库**：${input.repository}`);
  if (template?.showChannel !== false) lines.push(`**通道**：${input.channel}`);
  if (template?.showLinks !== false && input.releaseUrl) lines.push(`**Release**：${input.releaseUrl}`);
  if (template?.showLinks !== false && input.workflowUrl) lines.push(`**Workflow**：${input.workflowUrl}`);
  if (template?.signature) lines.push(`_${template.signature}_`);

  const headerTemplate = template?.preset === "ember" ? "orange" : template?.preset === "ocean" ? "turquoise" : "blue";

  return {
    config: {
      wide_screen_mode: true,
    },
    header: {
      template: headerTemplate,
      title: {
        tag: "plain_text",
        content: title,
      },
    },
    elements: [
      {
        tag: "div",
        text: {
          tag: "lark_md",
          content: lines.join("\n\n"),
        },
      },
    ],
  };
}
