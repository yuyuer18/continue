import { Tool } from "../..";

import { BuiltInToolNames } from "../builtIn";

export const searchWebTool: Tool = {
  type: "function",
  displayTitle: "搜索Web网页",
  wouldLikeTo: 'search the web for "{{{ query }}}"',
  readonly: true,
  function: {
    name: BuiltInToolNames.SearchWeb,
    description:
      "Performs a web search, returning top results. Use this tool sparingly - only for questions that require specialized, external, and/or up-to-date knowledege. Common programming questions do not require web search.",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description: "The natural language search query",
        },
      },
    },
  },
};
