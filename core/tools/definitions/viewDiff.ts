import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const viewDiffTool: Tool = {
  type: "function",
  displayTitle: "查看差异",
  wouldLikeTo: "查看 git 差异",
  isCurrently: "获取 git 差异",
  hasAlready: "已查看 git 差异",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ViewDiff,
    description: "查看当前工作更改的差异",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  systemMessageDescription: {
    prefix: `要查看当前的 git 差异，请使用 ${BuiltInToolNames.ViewDiff} 工具。这将显示工作目录中与上次提交相比所做的更改。`,
  },
  defaultToolPolicy: "allowedWithoutPermission",
  toolCallIcon: "CodeBracketIcon",
};
