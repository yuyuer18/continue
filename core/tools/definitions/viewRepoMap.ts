import { Tool } from "../..";

import { BuiltInToolNames } from "../builtIn";

export const viewRepoMapTool: Tool = {
  type: "function",
  displayTitle: "查看仓库地图",
  wouldLikeTo: "view the repository map",
  readonly: true,
  function: {
    name: BuiltInToolNames.ViewRepoMap,
    description: "View the repository map",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
