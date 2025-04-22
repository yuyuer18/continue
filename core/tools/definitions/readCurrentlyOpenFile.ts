import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const readCurrentlyOpenFileTool: Tool = {
  type: "function",
  displayTitle: "读取当前打开的问题",
  wouldLikeTo: "read the current file",
  isCurrently: "reading the current file",
  hasAlready: "read the current file",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadCurrentlyOpenFile,
    description:
      "读取 IDE 中当前打开的文件。如果在引用看不到的文件，可使用该工具",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
