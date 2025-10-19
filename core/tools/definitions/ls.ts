import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const lsTool: Tool = {
  type: "function",
  displayTitle: "ls",
  wouldLikeTo: "list files in {{{ dirPath }}}",
  isCurrently: "listing files in {{{ dirPath }}}",
  hasAlready: "listed files in {{{ dirPath }}}",
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
    prefix: `To list files and folders in a given directory, call the ${BuiltInToolNames.LSTool} tool with "dirPath" and "recursive". For example:`,
    exampleArgs: [
      ["dirPath", "path/to/dir"],
      ["recursive", "false"],
    ],
  },
  toolCallIcon: "FolderIcon",
};
