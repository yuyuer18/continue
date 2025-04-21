import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const lsTool: Tool = {
  type: "function",
  displayTitle: "LS Tool",
  wouldLikeTo: "list files and folders in {{{ dirPath }}}",
  isCurrently: "listing files and folders in {{{ dirPath }}}",
  hasAlready: "listed files and folders in {{{ dirPath }}}",
  readonly: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.LSTool,
    description: "列出给定目录中的文件和文件夹",
    parameters: {
      type: "object",
      required: ["dirPath", "recursive"],
      properties: {
        dirPath: {
          type: "string",
          description:
            "相对于项目根目录的目录路径。始终使用正斜杠路径，如 '/'。 不是 '.'",
        },
        recursive: {
          type: "boolean",
          description:
            "If true, lists files and folders recursively. To prevent unexpected large results, use this sparingly",
        },
      },
    },
  },
};
