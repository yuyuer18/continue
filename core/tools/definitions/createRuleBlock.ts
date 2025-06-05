import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export const createRuleBlock: Tool = {
  type: "function",
  displayTitle: "Create Rule Block",
  wouldLikeTo: 'create a rule block for "{{{ name }}}"',
  isCurrently: 'creating a rule block for "{{{ name }}}"',
  hasAlready: 'created a rule block for "{{{ name }}}"',
  readonly: false,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.CreateRuleBlock,
    description:
      "创建适用于所有未来对话的规则。可以制定统一应用的代码标准或偏好设置。若要修改现有规则，请改用编辑工具.",
    parameters: {
      type: "object",
      required: ["name", "rule", "alwaysApply", "description"],
      properties: {
        name: {
          type: "string",
          description:
            "简要的描述性名称，概括规则的目的（例如 “React 标准”、“类型提示”）",
        },
        rule: {
          type: "string",
          description:
            "针对未来代码生成的清晰、必要指令（例如 “使用具名导出”、“添加 Python 类型提示”）。每条规则应专注于一个特定标准.",
        },
        description: {
          type: "string",
          description: "Short description of the rule",
        },
        globs: {
          type: "string",
          description:
            "此规则适用的可选文件模式 (如. ['**/*.{ts,tsx}'] 或 ['src/**/*.ts', 'tests/**/*.ts'])",
        },
        alwaysApply: {
          type: "boolean",
          description:
            "Whether this rule should always be applied regardless of file pattern matching",
        },
      },
    },
  },
};
