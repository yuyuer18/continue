import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const readCurrentlyOpenFileTool: Tool = {
  type: "function",
  displayTitle: "读取当前打开的问题",
  wouldLikeTo: "read the current file",
  isCurrently: "reading the current file",
  hasAlready: "read the current file",
  readonly: true,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.ReadCurrentlyOpenFile,
    description:
      "读取 IDE 中当前打开的文件。如果在引用看不到的文件，可使用该工具",
    parameters: {
      type: "object",
      properties: {},
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `要查看用户当前打开的文件，请使用 ${BuiltInToolNames.ReadCurrentlyOpenFile} 工具。
如果用户询问某个文件但你没有看到任何代码，请使用此工具检查当前文件`,
  },
  toolCallIcon: "DocumentTextIcon",
};
