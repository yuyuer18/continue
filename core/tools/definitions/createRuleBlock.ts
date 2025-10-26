import { Tool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

const NAME_ARG_DESC =
  "Short, descriptive name summarizing the rule's purpose (e.g. 'React Standards', 'Type Hints')";
const RULE_ARG_DESC =
  "Clear, imperative instruction for future code generation (e.g. 'Use named exports', 'Add Python type hints'). Each rule should focus on one specific standard.";
const DESC_ARG_DESC =
  "Description of when this rule should be applied. Required for Agent Requested rules (AI decides when to apply). Optional for other types.";
const GLOB_ARG_DESC =
  "Optional file patterns to which this rule applies (e.g. ['**/*.{ts,tsx}'] or ['src/**/*.ts', 'tests/**/*.ts'])";
const REGEX_ARG_DESC =
  "Optional regex patterns to match against file content. Rule applies only to files whose content matches the pattern (e.g. 'useEffect' for React hooks or '\\bclass\\b' for class definitions)";

const ALWAYS_APPLY_DESC =
  "Whether this rule should always be applied. Set to false for Agent Requested and Manual rules. Omit or set to true for Always and Auto Attached rules.";

export const createRuleBlock: Tool = {
  type: "function",
  displayTitle: "创建规则块",
  wouldLikeTo: '为 "{{{ name }}}" 创建规则块',
  isCurrently: '正在为 "{{{ name }}}" 创建规则块',
  hasAlready: '已为 "{{{ name }}}" 创建规则块',
  readonly: false,
  isInstant: true,
  group: BUILT_IN_GROUP_NAME,
  function: {
    name: BuiltInToolNames.CreateRuleBlock,
    description:
      'Creates a "rule" that can be referenced in future conversations. This should be used whenever you want to establish code standards / preferences that should be applied consistently, or when you want to avoid making a mistake again. To modify existing rules, use the edit tool instead.\n\nRule Types:\n- Always: Include only "rule" (always included in model context)\n- Auto Attached: Include "rule", "globs", and/or "regex" (included when files match patterns)\n- Agent Requested: Include "rule" and "description" (AI decides when to apply based on description)\n- Manual: Include only "rule" (only included when explicitly mentioned using @ruleName)',
    parameters: {
      type: "object",
      required: ["name", "rule"],
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
            "此规则何时应用的描述。对于代理请求规则是必需的（AI决定何时应用）。对于其他类型是可选的。",
        },
        globs: {
          type: "string",
          description:
            "此规则适用的可选文件模式（例如 ['**/*.{ts,tsx}'] 或 ['src/**/*.ts', 'tests/**/*.ts']）",
        },
        regex: {
          type: "string",
          description:
            "可选的正则表达式模式，用于匹配文件内容。规则仅适用于内容匹配模式的文件（例如，React钩子的'useEffect'或类定义的'\\bclass\\b'）",
        },
        alwaysApply: {
          type: "boolean",
          description:
            "此规则是否应始终应用。对于代理请求和手动规则设置为false。对于始终和自动附加规则，省略或设置为true。",
        },
      },
    },
  },
  defaultToolPolicy: "allowedWithPermission",
  systemMessageDescription: {
    prefix: `有时用户会对你的输出提供反馈或指导。如果你不知道这些"规则"，考虑使用 ${BuiltInToolNames.CreateRuleBlock} 工具将规则持久化以供未来交互使用。
此工具不能用于编辑现有规则，但你可以搜索 ".continue/rules" 文件夹并使用编辑工具来管理规则。
要创建规则，请使用 ${BuiltInToolNames.CreateRuleBlock} 工具调用并包含以下参数：
- name: 简要的描述性名称，概括规则的目的（例如 "React 标准"、"类型提示"）
- rule: 针对未来代码生成的清晰、必要指令（例如 "使用具名导出"、"添加 Python 类型提示"）。每条规则应专注于一个特定标准。
- description: 此规则何时应用的描述。对于代理请求规则是必需的（AI决定何时应用）。对于其他类型是可选的。
- globs: 此规则适用的可选文件模式（例如 ['**/*.{ts,tsx}'] 或 ['src/**/*.ts', 'tests/**/*.ts']）
- alwaysApply: 此规则是否应始终应用。对于代理请求和手动规则设置为false。对于始终和自动附加规则，省略或设置为true。
例如：`,
    exampleArgs: [
      ["name", "使用 PropTypes"],
      ["rule", "声明 React 组件属性时始终使用 PropTypes"],
      [
        "description",
        "确保所有属性类型都明确声明，以提高 React 组件的类型安全性和代码可维护性。",
      ],
      ["globs", "**/*.js"],
      ["alwaysApply", "false"],
    ],
  },
  toolCallIcon: "PencilIcon",
};
