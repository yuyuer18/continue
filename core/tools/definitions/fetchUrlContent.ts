import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const fetchUrlContentTool: Tool = {
  type: "function",
  displayTitle: "读取URL",
  wouldLikeTo: "获取 {{{ url }}}",
  isCurrently: "正在获取 {{{ url }}}",
  hasAlready: "已获取 {{{ url }}}",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.FetchUrlContent,
    description: "可以使用URL查看网站的内容。不要将此用于文件。",
    parameters: {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string",
          description: "要读取的URL",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `要获取URL的内容，请使用 ${BuiltInToolNames.FetchUrlContent} 工具。例如，要读取网页内容，你可以这样响应：`,
    exampleArgs: [["url", "https://example.com"]],
  },
  toolCallIcon: "GlobeAltIcon",
};
