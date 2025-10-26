import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

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
            "相对于项目根目录的目录路径。始终使用正斜杠路径，如 '/'。 不是 '.'",
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
};
