import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const globSearchTool: Tool = {
  type: "function",
  displayTitle: "全局文件搜索",
  wouldLikeTo: 'find file matches for "{{{ pattern }}}"',
  isCurrently: 'finding file matches for "{{{ pattern }}}"',
  hasAlready: 'retrieved file matches for "{{{ pattern }}}"',
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.FileGlobSearch,
    description: "搜索项目中的文件",
    parameters: {
      type: "object",
      required: ["pattern"],
      properties: {
        pattern: {
          type: "string",
          description: "用于文件路径匹配的全局Glob模式",
        },
      },
    },
  },
};
