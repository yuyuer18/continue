import { Tool } from "../..";

import { ToolPolicy } from "@continuedev/terminal-security";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const lsTool: Tool = {
  type: "function",
  displayTitle: "列出文件",
  wouldLikeTo: "列出 {{{ dirPath }}} 中的文件",
  isCurrently: "正在列出 {{{ dirPath }}} 中的文件",
  hasAlready: "已列出 {{{ dirPath }}} 中的文件",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.LSTool,
    description: "列出给定目录中的文件和文件夹",
    parameters: {
      type: "object",
      properties: {
        dirPath: {
          type: "string",
          description:
            "The directory path. Can be relative to project root, absolute path, tilde path (~/...), or file:// URI. Use forward slash paths",
        },
        recursive: {
          type: "boolean",
          description:
            "如果是，则递归列出文件和文件夹。为避免出现意外的大量结果，请谨慎使用此选项。",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `要列出给定目录中的文件和文件夹，请调用 ${BuiltInToolNames.LSTool} 工具，提供 "dirPath" 和 "recursive" 参数。例如：`,
    exampleArgs: [
      ["dirPath", "path/to/dir"],
      ["recursive", "false"],
    ],
  },
  toolCallIcon: "FolderIcon",
  preprocessArgs: async (args, { ide }) => {
    const dirPath = args.dirPath as string;

    // Default to current directory if no path provided
    const pathToResolve = dirPath || ".";
    const resolvedPath = await resolveInputPath(ide, pathToResolve);

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
