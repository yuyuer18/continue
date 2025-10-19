import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const createNewFileTool: Tool = {
  type: "function",
  displayTitle: "Create New File",
  wouldLikeTo: "create {{{ filepath }}}",
  isCurrently: "creating {{{ filepath }}}",
  hasAlready: "created {{{ filepath }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  isInstant: true,
  function: {
    name: BuiltInToolNames.CreateNewFile,
    description:
      "创建新文件。仅在文件不存在且需要创建时使用此操作。",
    parameters: {
      type: "object",
      required: ["filepath", "contents"],
      properties: {
        filepath: {
          type: "string",
          description:
            "文件创建位置填相对路径，从工作区根目录算起（别写全路径）",
        },
        contents: {
          type: "string",
          description: "写到新文件中的文件",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `To create a NEW file, use the ${BuiltInToolNames.CreateNewFile} tool with the relative filepath and new contents. For example, to create a file located at 'path/to/file.txt', you would respond with:`,
    exampleArgs: [
      ["filepath", "path/to/the_file.txt"],
      ["contents", "Contents of the file"],
    ],
  },
};
