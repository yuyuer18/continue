import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export interface EditToolArgs {
  filepath: string;
  new_contents: string;
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
      required: ["filepath", "new_contents"],
      properties: {
        filepath: {
          type: "string",
          description:
            "编辑的文件的路径，相对于工作区的根目录.",
        },
        new_contents: {
          type: "string",
          description: "新文件内容",
        },
      },
    },
  },
};
