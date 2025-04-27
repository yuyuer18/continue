import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export interface EditToolArgs {
  filepath: string;
  changes: string;
}

export const editFileTool: Tool = {
  type: "function",
  displayTitle: "Edit File",
  wouldLikeTo: "edit {{{ filepath }}}",
  isCurrently: "editing {{{ filepath }}}",
  hasAlready: "edited {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  function: {
    name: BuiltInToolNames.EditExistingFile,
    description:
      "使用此工具编辑现有文件。如不知道文件的内容，请先阅读它.",
    parameters: {
      type: "object",
      required: ["filepath", "changes"],
      properties: {
        filepath: {
          type: "string",
          description:
            "编辑的文件的路径，相对于工作区的根目录.",
        },
        changes: {
          type: "string",
          description:
            "对文件的任何修改，仅展示必要的更改。请勿将此内容包含在代码块中。对于未修改的大段内容，使用简洁且合适的占位符，例如 '//... 此处为代码的其余部分...'",
        },
      },
    },
  },
};
