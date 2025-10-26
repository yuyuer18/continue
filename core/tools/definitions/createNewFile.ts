import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

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
            "文件创建位置填相对路径，从工作区根目录算起（别写全路径）",
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
};
