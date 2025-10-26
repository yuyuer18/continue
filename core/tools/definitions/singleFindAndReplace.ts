import { Tool } from "../..";
import { validateSingleEdit } from "../../edit/searchAndReplace/findAndReplaceUtils";
import { executeFindAndReplace } from "../../edit/searchAndReplace/performReplace";
import { validateSearchAndReplaceFilepath } from "../../edit/searchAndReplace/validateArgs";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { NO_PARALLEL_TOOL_CALLING_INSTRUCTION } from "./editFile";

export interface SingleFindAndReplaceArgs {
  filepath: string;
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export const singleFindAndReplaceTool: Tool = {
  type: "function",
  displayTitle: "Find and Replace",
  wouldLikeTo: "edit {{{ filepath }}}",
  isCurrently: "editing {{{ filepath }}}",
  hasAlready: "edited {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: false,
  function: {
    name: BuiltInToolNames.SingleFindAndReplace,
    description: `在文件中执行精确的字符串替换。

重要提示：
- 在进行编辑之前，务必使用 \`${BuiltInToolNames.ReadFile}\` 工具来了解文件的最新内容和上下文。用户可能会在你处理文件时进行编辑。
- ${NO_PARALLEL_TOOL_CALLING_INSTRUCTION}
- 编辑从 \`${BuiltInToolNames.ReadFile}\` 工具输出的文本时，确保保留精确的空格/缩进。
- 只有在用户明确要求时才使用表情符号。除非被要求，否则避免向文件添加表情符号。
- 使用 \`replace_all\` 参数可以在整个文件中替换和重命名字符串。例如，如果你想重命名一个变量，这个参数会很有用。

警告：
- 如果不使用 \`replace_all\`，当 \`old_string\` 在文件中不唯一时，编辑将失败。要么提供包含更多周围上下文的更大字符串使其唯一，要么使用 \`replace_all\` 来更改 \`old_string\` 的所有实例。
- 如果你最近没有使用 \`${BuiltInToolNames.ReadFile}\` 工具查看最新的文件内容，编辑很可能会失败。`,
    parameters: {
      type: "object",
      required: ["filepath", "old_string", "new_string"],
      properties: {
        filepath: {
          type: "string",
          description: "要修改的文件路径，相对于工作区根目录",
        },
        old_string: {
          type: "string",
          description: "要替换的文本 - 必须精确匹配，包括空格/缩进",
        },
        new_string: {
          type: "string",
          description: "替换后的文本（必须与 old_string 不同）",
        },
        replace_all: {
          type: "boolean",
          description: "替换所有出现的 old_string（默认为 false）",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `To perform exact string replacements in files, use the ${BuiltInToolNames.SingleFindAndReplace} tool with a filepath (relative to the root of the workspace) and the strings to find and replace.

  For example, you could respond with:`,
    exampleArgs: [
      ["filepath", "path/to/file.ts"],
      ["old_string", "const oldVariable = 'value'"],
      ["new_string", "const newVariable = 'updated'"],
      ["replace_all", "false"],
    ],
  },
  defaultToolPolicy: "allowedWithPermission",
  preprocessArgs: async (args, extras) => {
    const { oldString, newString, replaceAll } = validateSingleEdit(
      args.old_string,
      args.new_string,
      args.replace_all,
    );
    const fileUri = await validateSearchAndReplaceFilepath(
      args.filepath,
      extras.ide,
    );

    const editingFileContents = await extras.ide.readFile(fileUri);
    const newFileContents = executeFindAndReplace(
      editingFileContents,
      oldString,
      newString,
      replaceAll ?? false,
      0,
    );

    return {
      ...args,
      fileUri,
      editingFileContents,
      newFileContents,
    };
  },
};
