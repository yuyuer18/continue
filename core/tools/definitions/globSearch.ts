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
    description:
      "使用全局模式在项目中递归搜索文件。支持 ** 递归目录搜索。输出可能会被截断；使用目标模式",
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
  defaultToolPolicy: "allowedWithoutPermission",
  systemMessageDescription: {
    prefix: `To return a list of files based on a glob search pattern, use the ${BuiltInToolNames.FileGlobSearch} tool`,
    exampleArgs: [["pattern", "*.py"]],
  },
  toolCallIcon: "MagnifyingGlassIcon",
};
