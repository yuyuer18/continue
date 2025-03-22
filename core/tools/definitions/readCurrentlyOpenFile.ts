import { Tool } from "../..";
import { BuiltInToolNames } from "../builtIn";

export const readCurrentlyOpenFileTool: Tool = {
  type: "function",
  displayTitle: "读取当前打开的问题",
  wouldLikeTo: "read the current file",
  readonly: true,
  function: {
    name: BuiltInToolNames.ReadCurrentlyOpenFile,
    description:
      "Read the currently open file in the IDE. If the user seems to be referring to a file that you can't see, try using this",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
