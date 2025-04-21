import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const runTerminalCommandTool: Tool = {
  type: "function",
  displayTitle: "Run Terminal Command",
  wouldLikeTo: "run the following terminal command:",
  isCurrently: "running the following terminal command:",
  hasAlready: "ran the following terminal command:",
  readonly: false,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.RunTerminalCommand,
    description:
      "在当前终端运行命令.\
      终端状态是无状态的，不会记住上一个命令.\
      当在后台运行命令时，始终建议使用 shell 命令来停止它；绝不要建议使用 Ctrl+C。\
      当建议后续的 shell 命令时，始终将它们格式化为 shell 命令块。\
      不要执行需要特殊 / 管理员权限的操作。",
    parameters: {
      type: "object",
      required: ["command"],
      properties: {
        command: {
          type: "string",
          description:
            "运行的命令。这将直接传入 IDE 终端中.",
        },
        waitForCompletion: {
          type: "boolean",
          description:
            "是否在返回前等待命令完成。默认值为 true。设置为 false 以在后台运行命令。设置为 true 以在前台运行命令并等待收集输出。",
        },
      },
    },
  },
};
