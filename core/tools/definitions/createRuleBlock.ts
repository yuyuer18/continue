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
      'Creates a "rule" that can be referenced in future conversations. This should be used whenever you want to establish code standards / preferences that should be applied consistently, or when you want to avoid making a mistake again. To modify existing rules, use the edit tool instead.\n\nRule Types:\n- Always: Include only "rule" (always included in model context)\n- Auto Attached: Include "rule", "globs", and/or "regex" (included when files match patterns)\n- Agent Requested: Include "rule" and "description" (AI decides when to apply based on description)\n- Manual: Include only "rule" (only included when explicitly mentioned using @ruleName)',
    parameters: {
      type: "object",
      required: ["name", "rule", "description"],
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
          description:
            "Description of when this rule should be applied. Required for Agent Requested rules (AI decides when to apply). Optional for other types.",
        },
        globs: {
          type: "string",
          description:
            "此规则适用的可选文件模式 (如. ['**/*.{ts,tsx}'] 或 ['src/**/*.ts', 'tests/**/*.ts'])",
        },
        regex: {
          type: "string",
          description:
            "Optional regex patterns to match against file content. Rule applies only to files whose content matches the pattern (e.g. 'useEffect' for React hooks or '\\bclass\\b' for class definitions)",
        },
        alwaysApply: {
          type: "boolean",
          description:
            "Whether this rule should always be applied. Set to false for Agent Requested and Manual rules. Omit or set to true for Always and Auto Attached rules.",
        },
      },
    },
  },
};
