import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const readFileTool: Tool = {
  type: "function",
  displayTitle: "读取文件",
  wouldLikeTo: "read {{{ filepath }}}",
  isCurrently: "reading {{{ filepath }}}",
  hasAlready: "read {{{ filepath }}}",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadFile,
    description: "使用这个工具可以查看存在文件的内容",
    parameters: {
      type: "object",
      required: ["filepath"],
      properties: {
        filepath: {
          type: "string",
          description:
            "要读取的文件路径，相对于工作区根目录（不是 uri 或绝对路径）",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `要读取具有已知文件路径的文件，请使用 ${BuiltInToolNames.ReadFile} 工具。例如，要读取位于 'path/to/file.txt' 的文件，你可以这样响应：`,
    exampleArgs: [["filepath", "path/to/the_file.txt"]],
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "DocumentIcon",
};
