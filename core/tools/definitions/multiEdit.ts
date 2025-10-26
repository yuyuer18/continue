import { Tool } from "../..";
import { validateMultiEdit } from "../../edit/searchAndReplace/multiEditValidation";
import { executeMultiFindAndReplace } from "../../edit/searchAndReplace/performReplace";
import { validateSearchAndReplaceFilepath } from "../../edit/searchAndReplace/validateArgs";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";
import { NO_PARALLEL_TOOL_CALLING_INSTRUCTION } from "./editFile";

export interface EditOperation {
  old_string: string;
  new_string: string;
  replace_all?: boolean;
}

export interface MultiEditArgs {
  filepath: string;
  edits: EditOperation[];
}

export const multiEditTool: Tool = {
  type: "function",
  displayTitle: "多重编辑",
  wouldLikeTo: "编辑 {{{ filepath }}}",
  isCurrently: "正在编辑 {{{ filepath }}}",
  hasAlready: "已编辑 {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: false,
  function: {
    name: BuiltInToolNames.MultiEdit,
    description: `使用此工具在一次操作中对单个文件进行多次编辑。它允许你高效地执行多个查找和替换操作。

要对文件进行多次编辑，请提供以下内容：
1. filepath: 要修改的文件的路径，相对于项目/工作区根目录（验证目录路径是否正确）
2. edits: 要执行的编辑操作数组，每个编辑包含：
   - old_string: 要替换的文本（必须与旧文件内容完全匹配，包括所有空格/缩进）
   - new_string: 替换old_string的编辑文本
   - replace_all: 替换文件中所有出现的old_string。此参数是可选的，默认为false。

重要提示：
- 文件可能在工具调用之间被用户、linter等修改，因此尽可能在一次工具调用中完成所有编辑。例如，如果文件中有其他更改，不要只编辑导入，因为未使用的导入可能在工具调用之间被linter删除。
- 所有编辑按提供的顺序依次应用
- 每个编辑都在前一个编辑的结果上操作，因此请仔细规划编辑以避免顺序操作之间的冲突
- 编辑是原子性的 - 所有编辑必须有效才能使操作成功 - 如果任何编辑失败，都不会应用任何编辑
- 当你需要对同一文件的不同部分进行多次更改时，此工具是理想的选择

关键要求：
1. 在进行编辑之前，务必使用 ${BuiltInToolNames.ReadFile} 工具来了解文件的最新内容和上下文。用户可能会在你处理文件时进行编辑。
2. ${NO_PARALLEL_TOOL_CALLING_INSTRUCTION}
3. 进行编辑时：
- 确保所有编辑都产生惯用的、正确的代码
- 不要将代码留在损坏状态
- 只有在用户明确要求时才使用表情符号。除非被要求，否则避免向文件添加表情符号
- 使用replace_all来替换和重命名文件中字符串的所有匹配项。例如，如果你想重命名一个变量，这个参数会很有用

警告：
- 如果较早的编辑影响了较晚编辑试图查找的文本，文件可能会变得混乱
- 如果edits.old_string与文件内容不完全匹配（包括空格），工具将失败
- 如果edits.old_string和edits.new_string相同，工具将失败 - 它们必须不同`,
    parameters: {
      type: "object",
      required: ["filepath", "edits"],
      properties: {
        filepath: {
          type: "string",
          description: "要修改的文件路径，相对于工作区根目录",
        },
        edits: {
          type: "array",
          description: "要在文件上顺序执行的编辑操作数组",
          items: {
            type: "object",
            required: ["old_string", "new_string"],
            properties: {
              old_string: {
                type: "string",
                description: "要替换的文本（精确匹配，包括空格/缩进）",
              },
              new_string: {
                type: "string",
                description: "替换后的文本。必须与old_string不同。",
              },
              replace_all: {
                type: "boolean",
                description: "替换文件中所有出现的old_string（默认为false）",
              },
            },
          },
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: `要对单个文件进行多次编辑，请使用 ${BuiltInToolNames.MultiEdit} 工具，提供文件路径（相对于工作区根目录）和编辑操作数组。

  例如，你可以这样响应：`,
    exampleArgs: [
      ["filepath", "path/to/file.ts"],
      [
        "edits",
        `[
  { "old_string": "const oldVar = 'value'", "new_string": "const newVar = 'updated'" },
  { "old_string": "oldFunction()", "new_string": "newFunction()", "replace_all": true }
]`,
      ],
    ],
  },
  defaultToolPolicy: "allowedWithPermission",
  preprocessArgs: async (args, extras) => {
    const { edits } = validateMultiEdit(args);
    const fileUri = await validateSearchAndReplaceFilepath(
      args.filepath,
      extras.ide,
    );

    const editingFileContents = await extras.ide.readFile(fileUri);
    const newFileContents = executeMultiFindAndReplace(
      editingFileContents,
      edits,
    );

    return {
      ...args,
      fileUri,
      editingFileContents,
      newFileContents,
    };
  },
};
