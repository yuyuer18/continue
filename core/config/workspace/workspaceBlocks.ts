import {
  BlockType,
  ConfigYaml,
  createRuleMarkdown,
  RULE_FILE_EXTENSION,
} from "@continuedev/config-yaml";
import * as YAML from "yaml";
import { IDE } from "../..";
import { joinPathsToUri } from "../../util/uri";

const BLOCK_TYPE_CONFIG: Record<
  BlockType,
  { singular: string; filename: string }
> = {
  context: { singular: "context", filename: "context" },
  models: { singular: "model", filename: "model" },
  rules: { singular: "rule", filename: "rule" },
  docs: { singular: "doc", filename: "doc" },
  prompts: { singular: "prompt", filename: "prompt" },
  mcpServers: { singular: "MCP server", filename: "mcp-server" },
  data: { singular: "data", filename: "data" },
};

function getContentsForNewBlock(blockType: BlockType): ConfigYaml {
  const configYaml: ConfigYaml = {
    name: `New ${BLOCK_TYPE_CONFIG[blockType]?.singular}`,
    version: "0.0.1",
    schema: "v1",
  };
  switch (blockType) {
    case "context":
      configYaml.context = [
        {
          provider: "file",
        },
      ];
      break;
    case "models":
      configYaml.models = [
        {
          provider: "anthropic",
          model: "claude-3-7-sonnet-latest",
          apiKey: "${{ secrets.ANTHROPIC_API_KEY }}",
          name: "Claude 3.7 Sonnet",
          roles: ["chat", "edit"],
        },
      ];
      break;
    case "rules":
      configYaml.rules = ["始终给出简洁的答案", "使用中文回答"];
      break;
    case "docs":
      configYaml.docs = [
        {
          name: "A3UI API Docs",
          startUrl: "http://192.168.65.227:3000/vue-a3ui-doc/api-docs",
        },
      ];
      break;
    case "prompts":
      configYaml.prompts = [
        {
          name: "前端开发提示词",
          description: "采用A3UI开发的前端开发提示词",
          prompt:
            "该工程采用Vue3+ElementPlus架构\n表单使用a3-ow-info组件\n请给出一个Vue3+ElementPlus的表单示例代码",
        },
      ];
      break;
    case "mcpServers":
      configYaml.mcpServers = [
        {
          name: "New MCP server",
          command: "npx",
          args: ["-y", "<your-mcp-server>"],
          env: {},
        },
      ];
      break;
  }

  return configYaml;
}

function getFileExtension(blockType: BlockType): string {
  return blockType === "rules" ? RULE_FILE_EXTENSION : "yaml";
}

export function getFileContent(blockType: BlockType): string {
  if (blockType === "rules") {
    return createRuleMarkdown("New Rule", "Your rule content", {
      description: "A description of your rule",
    });
  } else {
    return YAML.stringify(getContentsForNewBlock(blockType));
  }
}

export async function findAvailableFilename(
  baseDirUri: string,
  blockType: BlockType,
  fileExists: (uri: string) => Promise<boolean>,
  extension?: string,
): Promise<string> {
  const baseFilename = `new-${BLOCK_TYPE_CONFIG[blockType]?.filename}`;
  const fileExtension = extension ?? getFileExtension(blockType);
  let counter = 0;
  let fileUri: string;

  do {
    const suffix = counter === 0 ? "" : `-${counter}`;
    fileUri = joinPathsToUri(
      baseDirUri,
      `${baseFilename}${suffix}.${fileExtension}`,
    );
    counter++;
  } while (await fileExists(fileUri));

  return fileUri;
}

export async function createNewWorkspaceBlockFile(
  ide: IDE,
  blockType: BlockType,
): Promise<void> {
  const workspaceDirs = await ide.getWorkspaceDirs();
  if (workspaceDirs.length === 0) {
    throw new Error(
      "未找到工作区目录。请确保你已在集成开发环境中打开了一个文件夹。",
    );
  }

  const baseDirUri = joinPathsToUri(workspaceDirs[0], `.continue/${blockType}`);

  const fileUri = await findAvailableFilename(
    baseDirUri,
    blockType,
    ide.fileExists.bind(ide),
  );

  const fileContent = getFileContent(blockType);

  await ide.writeFile(fileUri, fileContent);
  await ide.openFile(fileUri);
}
