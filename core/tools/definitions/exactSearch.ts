import { Tool } from "../..";
import { BuiltInToolNames } from "../builtIn";

export const exactSearchTool: Tool = {
  type: "function",
  displayTitle: "精准搜索",
  wouldLikeTo: '在仓库中搜索 "{{{ query }}}" ',
  readonly: true,
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
