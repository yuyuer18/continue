import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const exactSearchTool: Tool = {
  type: "function",
  displayTitle: "Exact Search",
  wouldLikeTo: 'search for "{{{ query }}}" in the repository',
  isCurrently: 'getting search results for "{{{ query }}}"',
  hasAlready: 'retreived search results for "{{{ query }}}"',
  readonly: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ExactSearch,
    description: "使用 ripgrep 在仓库中执行精准搜索.",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description:
            "The search query to use. Must be a valid ripgrep regex expression, escaped where needed",
        },
      },
    },
  },
};
