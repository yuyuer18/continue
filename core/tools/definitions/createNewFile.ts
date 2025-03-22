import { Tool } from "../..";
import { BuiltInToolNames } from "../builtIn";

export const createNewFileTool: Tool = {
  type: "function",
  displayTitle: "创建新文件",
  wouldLikeTo: "create a new file",
  readonly: false,
  function: {
    name: BuiltInToolNames.CreateNewFile,
    description:
      "创建新文件。仅在文件不存在且需要创建时使用此操作。",
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
};
