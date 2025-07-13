import { Tool } from "../..";
import { EDIT_CODE_INSTRUCTIONS } from "../../llm/defaultSystemMessages";
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
  isInstant: false,
  function: {
    name: BuiltInToolNames.EditExistingFile,
    description: `使用此工具编辑现有文件。如果你不知道文件的内容，请先读取它.\n${EDIT_CODE_INSTRUCTIONS}`,
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
            "对文件的任何修改，仅展示必要的更改。请勿将其包装在代码块中，除了代码更改之外不要写任何内容。在较大的文件中，对于未修改的大段内容，使用简短的、与语言相符的占位符，例如 “//... 现有代码...”。",
        },
      },
    },
  },
};
