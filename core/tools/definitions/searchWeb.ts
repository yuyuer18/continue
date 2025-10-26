import { Tool } from "../..";

import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const searchWebTool: Tool = {
  type: "function",
  displayTitle: "搜索Web网页",
  wouldLikeTo: 'search the web for "{{{ query }}}"',
  isCurrently: 'searching the web for "{{{ query }}}"',
  hasAlready: 'searched the web for "{{{ query }}}"',
  readonly: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.SearchWeb,
    description:
      "网络搜索，返回热门结果。谨慎使用此工具 - 仅用于需要专业、外部和 / 或最新知识的问题。常见的编程问题不需要网络搜索。",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "自然语言搜索查询",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `要搜索网页，请使用 ${BuiltInToolNames.SearchWeb} 工具并提供自然语言查询。例如，要搜索当前天气，你可以这样响应：`,
    exampleArgs: [["query", "旧金山现在的天气怎么样？"]],
  },
  toolCallIcon: "GlobeAltIcon",
};
