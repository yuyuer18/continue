import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const viewRepoMapTool: Tool = {
  type: "function",
  displayTitle: "查看仓库地图",
  wouldLikeTo: "view the repository map",
  isCurrently: "getting the repository map",
  hasAlready: "viewed the repository map",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ViewRepoMap,
    description: "查看存储库地图",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};
