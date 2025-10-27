import { ToolPolicy } from "@continuedev/terminal-security";
import { Tool } from "../..";
import { ResolvedPath, resolveInputPath } from "../../util/pathResolver";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { evaluateFileAccessPolicy } from "../policies/fileAccess";

export const createNewFileTool: Tool = {
  type: "function",
  displayTitle: "创建新文件",
  wouldLikeTo: "创建 {{{ filepath }}}",
  isCurrently: "正在创建 {{{ filepath }}}",
  hasAlready: "已创建 {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: true,
  function: {
    name: BuiltInToolNames.CreateNewFile,
    description: "创建新文件。仅在文件不存在且需要创建时使用此操作。",
    parameters: {
      type: "object",
      required: ["filepath", "contents"],
      properties: {
        filepath: {
          type: "string",
          description:
            "The path where the new file should be created. Can be a relative path (from workspace root), absolute path, tilde path (~/...), or file:// URI.",
        },
        contents: {
          type: "string",
          description: "写到新文件中的文件",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `要创建新文件，请使用 ${BuiltInToolNames.CreateNewFile} 工具，提供相对文件路径和新内容。例如，要创建位于 'path/to/file.txt' 的文件，你可以这样响应：`,
    exampleArgs: [
      ["filepath", "path/to/the_file.txt"],
      ["contents", "文件内容"],
    ],
  },
  preprocessArgs: async (args, { ide }) => {
    const filepath = args.filepath as string;
    const resolvedPath = await resolveInputPath(ide, filepath);

    // Store the resolved path info in args for policy evaluation
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
