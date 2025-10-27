import { ToolPolicy } from "@continuedev/terminal-security";
import { Tool } from "../..";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const readFileRangeTool: Tool = {
  type: "function",
  displayTitle: "读取文件范围",
  wouldLikeTo:
    "读取 {{{ filepath }}} 的第 {{{ startLine }}}-{{{ endLine }}} 行",
  isCurrently:
    "正在读取 {{{ filepath }}} 的第 {{{ startLine }}}-{{{ endLine }}} 行",
  hasAlready:
    "已读取 {{{ filepath }}} 的第 {{{ startLine }}}-{{{ endLine }}} 行",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadFileRange,
    description:
      "使用此工具从现有文件中读取特定范围的行。仅支持正行号（从开头开始，基于1）。要从文件末尾读取，请改用带有'tail'命令的终端工具。",
    parameters: {
      type: "object",
      required: ["filepath", "startLine", "endLine"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要读取的文件路径，相对于工作区根目录（不是uri或绝对路径）",
        },
        startLine: {
          type: "number",
          description:
            "起始行号（从开头开始，基于1）。必须是正整数。示例：1 = 第一行，10 = 第十行",
        },
        endLine: {
          type: "number",
          description:
            "The ending line number (1-based from start). Must be a positive integer greater than or equal to startLine. Example: 10 = tenth line, 20 = twentieth line",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `要从文件中读取特定范围的行，请使用 ${BuiltInToolNames.ReadFileRange} 工具。仅支持正行号（从开头开始，基于1）。要从文件末尾读取，请改用带有'tail'命令的终端工具：`,
    exampleArgs: [
      ["filepath", "path/to/the_file.txt"],
      ["startLine", 10],
      ["endLine", 20],
    ],
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "DocumentIcon",
  preprocessArgs: async (args, { ide }) => {
    const filepath = args.filepath as string;
    const resolvedPath = await resolveInputPath(ide, filepath);

    return {
      resolvedPath,
    };
  },
  evaluateToolCallPolicy: (
    basePolicy: ToolPolicy,
    _: Record<string, unknown>,
    processedArgs?: Record<string, unknown>,
  ): ToolPolicy => {
    const resolvedPath = processedArgs?.resolvedPath as
      | ResolvedPath
      | null
      | undefined;
    if (!resolvedPath) return basePolicy;

    return evaluateFileAccessPolicy(basePolicy, resolvedPath.isWithinWorkspace);
  },
};
