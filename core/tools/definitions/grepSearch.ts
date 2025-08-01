import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const grepSearchTool: Tool = {
  type: "function",
  displayTitle: "Grep Search",
  wouldLikeTo: 'search for "{{{ query }}}" in the repository',
  isCurrently: 'getting search results for "{{{ query }}}"',
  hasAlready: 'retrieved search results for "{{{ query }}}"',
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.GrepSearch,
    description:
      "使用 ripgrep 在存储库中执行搜索。输出可能会被截断，因此请使用有针对性的查询。",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description:
            "要使用的搜索查询。必须是有效的 ripgrep 正则表达式，必要时进行转义",
        },
      },
    },
  },
};
