import { ConfigDependentToolParams, GetTool } from "../..";
import { BUILT_IN_GROUP_NAME, BuiltInToolNames } from "../builtIn";

export interface RequestRuleArgs {
  name: string;
}

function getAvailableRules(rules: ConfigDependentToolParams["rules"]) {
  // Must be explicitly false and no globs
  const agentRequestedRules = rules.filter(
    (rule) => rule.alwaysApply === false && !rule.globs,
  );

  if (agentRequestedRules.length === 0) {
    return "没有可用的规则。";
  }

  return agentRequestedRules
    .map((rule) => `${rule.name}: ${rule.description}`)
    .join("\n");
}

export function getRequestRuleDescription(
  rules: ConfigDependentToolParams["rules"],
): string {
  const prefix =
    "使用此工具根据描述检索包含更多上下文/指令的附加'规则'。可用规则：\n";
  return prefix + getAvailableRules(rules);
}

function getRequestRuleSystemMessageDescription(
  rules: ConfigDependentToolParams["rules"],
): string {
  const prefix = `要根据描述检索包含更多上下文/指令的"规则"，请使用 ${BuiltInToolNames.RequestRule} 工具并指定规则名称。可用规则有：\n`;
  const availableRules = getAvailableRules(rules);
  const suffix = "\n\n例如，您可以这样响应：";
  return prefix + availableRules + suffix;
}

export const requestRuleTool: GetTool = ({ rules }) => ({
  type: "function",
  displayTitle: "请求规则",
  wouldLikeTo: "请求规则 {{{ name }}}",
  isCurrently: "正在读取规则 {{{ name }}}",
  hasAlready: "已读取规则 {{{ name }}}",
  group: BUILT_IN_GROUP_NAME,
  readonly: false,
  function: {
    name: BuiltInToolNames.RequestRule,
    description: getRequestRuleDescription(rules),
    parameters: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          description: "规则名称",
        },
      },
    },
  },
  systemMessageDescription: {
    prefix: getRequestRuleSystemMessageDescription(rules),
    exampleArgs: [["name", "rule_name"]],
  },
  defaultToolPolicy: "disabled",
});
