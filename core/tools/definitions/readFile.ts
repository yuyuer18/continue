import { Tool } from "../..";
import { BuiltInToolNames } from "../builtIn";

export const readFileTool: Tool = {
  type: "function",
  displayTitle: "读取文件",
  wouldLikeTo: "read {{{ filepath }}}",
  readonly: true,
  function: {
    name: BuiltInToolNames.ReadFile,
    description:
      "使用这个工具可以查看存在文件的内容",
    parameters: {
      type: "object",
      required: ["filepath"],
      properties: {
        filepath: {
          type: "string",
          description:
            "The path of the file to read, relative to the root of the workspace (NOT uri or absolute path)",
        },
      },
    },
  },
};
