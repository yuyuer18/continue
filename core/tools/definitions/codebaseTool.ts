import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const codebaseTool: Tool = {
  type: "function",
  displayTitle: "代码库搜索",
  wouldLikeTo: "在代码库中搜索: {{{ query }}}",
  isCurrently: "正在代码库中搜索: {{{ query }}}",
  hasAlready: "已在代码库中搜索: {{{ query }}}",
  readonly: true,
  isInstant: false,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.CodebaseTool,
    description:
      "使用此工具对代码库进行语义搜索，基于自然语言查询检索相关的代码片段。这有助于找到相关的代码上下文，以便理解或处理代码库。",
    parameters: {
      type: "object",
      required: ["query"],
      properties: {
        query: {
          type: "string",
          description:
            "在代码库中查找内容的自然语言描述（例如：'认证逻辑'、'数据库连接设置'、'错误处理'）",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `要搜索代码库，请使用 ${BuiltInToolNames.CodebaseTool} 工具并提供一个自然语言查询。例如，要查找认证逻辑，你可以这样响应：`,
    exampleArgs: [["query", "这个代码库中如何处理用户认证？"]],
  },
};
