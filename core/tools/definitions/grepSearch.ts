import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const grepSearchTool: Tool = {
  type: "function",
  displayTitle: "Grep搜索",
  wouldLikeTo: '搜索 "{{{ query }}}"',
  isCurrently: '正在搜索 "{{{ query }}}"',
  hasAlready: '已搜索 "{{{ query }}}"',
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
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `要在项目内执行grep搜索，请调用 ${BuiltInToolNames.GrepSearch} 工具并提供要匹配的查询模式。例如：`,
    exampleArgs: [["query", ".*main_services.*"]],
  },
  toolCallIcon: "MagnifyingGlassIcon",
};
