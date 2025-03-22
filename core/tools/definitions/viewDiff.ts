import { Tool } from "../..";

import { BuiltInToolNames } from "../builtIn";

export const viewDiffTool: Tool = {
  type: "function",
  displayTitle: "查看差异",
  wouldLikeTo: "view a diff",
  readonly: true,
  function: {
    name: BuiltInToolNames.ViewDiff,
    description: "View the current diff of working changes",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
