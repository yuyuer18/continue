import {
  ChatHistoryItem,
  ChatMessage,
  ContextItemWithId,
  RuleWithSource,
  TextMessagePart,
  ToolResultChatMessage,
  UserChatMessage,
} from "../";
import { findLast } from "../util/findLast";
import { normalizeToMessageParts } from "../util/messageContent";
import { isUserOrToolMsg } from "./messages";
import { getSystemMessageWithRules } from "./rules/getSystemMessageWithRules";

export const DEFAULT_CHAT_SYSTEM_MESSAGE_URL =
  "https://github.com/continuedev/continue/blob/main/core/llm/constructMessages.ts";

export const DEFAULT_AGENT_SYSTEM_MESSAGE_URL =
  "https://github.com/continuedev/continue/blob/main/core/llm/constructMessages.ts";

const EDIT_MESSAGE = `\
在编写代码块时，始终要在信息字符串中包含语言和文件名。例如，如果你正在编辑 “src/main.py”，你的代码块应该以 '\`\`\`python src/main.py'

在处理代码修改请求时，提供一个简洁的代码片段，该片段只强调必要的更改，并对未修改的部分使用缩写的占位符。例如:

  \`\`\`language /path/to/file
  // ... 现有代码 ...

  {{ 修改的代码 }}

  // ... 现有代码 ...

  {{ 其他修改代码 }}

  // ... 代码的其余部分 ...
  \`\`\`

  在现有文件中，你应该重述代码片段所属的函数或类:

  \`\`\`language /path/to/file
  // ... 现有代码 ...

  function exampleFunction() {
    // ... 现有代码 ...

    {{ 修改的代码 }}

    // ... 函数的其余部分 ...
  }

  // ... 代码的其余部分 ...
  \`\`\`

 由于用户可以访问他们的完整文件，他们更倾向于只阅读相关的修改内容。
 使用这些 “惰性” 注释省略文件开头、中间或结尾未修改的部分是完全可以接受的。
 只有在明确要求时才提供完整文件。除非用户特别要求只提供代码，否则应包含对更改的简要解释。
.
`

export const DEFAULT_CHAT_SYSTEM_MESSAGE = `\
<重要规则>
你处于Chat 对话模式.

如果用户要求对文件进行更改，告知他们可以使用代码块上的 “应用” 按钮，或者切换到代理模式以自动进行建议的更新。
如果需要，简要向用户解释他们可以使用模式选择器下拉菜单切换到代理模式，无需提供其他详细信息。


${EDIT_MESSAGE}
</重要规则>`;

export const DEFAULT_AGENT_SYSTEM_MESSAGE = `\
<重要规则>
 你处于Agent模式


${EDIT_MESSAGE}
</重要规则>`;

/**
 * Helper function to get the context items for a user message
 */
function getUserContextItems(
  userMsg: UserChatMessage | ToolResultChatMessage | undefined,
  history: ChatHistoryItem[],
): ContextItemWithId[] {
  if (!userMsg) return [];

  // Find the history item that contains the userMsg
  const historyItem = history.find((item) => {
    // Check if the message ID matches
    if ("id" in userMsg && "id" in item.message) {
      return (item.message as any).id === (userMsg as any).id;
    }
    // Fallback to content comparison
    return (
      item.message.content === userMsg.content &&
      item.message.role === userMsg.role
    );
  });

  return historyItem?.contextItems || [];
}

export function constructMessages(
  messageMode: string,
  history: ChatHistoryItem[],
  baseChatOrAgentSystemMessage: string | undefined,
  rules: RuleWithSource[],
): ChatMessage[] {
  const filteredHistory = history.filter(
    (item) => item.message.role !== "system",
  );
  const msgs: ChatMessage[] = [];

  for (let i = 0; i < filteredHistory.length; i++) {
    const historyItem = filteredHistory[i];

    if (messageMode === "chat") {
      const toolMessage: ToolResultChatMessage =
        historyItem.message as ToolResultChatMessage;
      if (historyItem.toolCallState?.toolCallId || toolMessage.toolCallId) {
        // remove all tool calls from the history
        continue;
      }
    }

    if (historyItem.message.role === "user") {
      // Gather context items for user messages
      let content = normalizeToMessageParts(historyItem.message);

      const ctxItems = historyItem.contextItems
        .map((ctxItem) => {
          return {
            type: "text",
            text: `${ctxItem.content}\n`,
          } as TextMessagePart;
        })
        .filter((part) => !!part.text.trim());

      content = [...ctxItems, ...content];
      msgs.push({
        ...historyItem.message,
        content,
      });
    } else {
      msgs.push(historyItem.message);
    }
  }

  const lastUserMsg = findLast(msgs, isUserOrToolMsg) as
    | UserChatMessage
    | ToolResultChatMessage
    | undefined;

  // Get context items for the last user message
  const lastUserContextItems = getUserContextItems(
    lastUserMsg,
    filteredHistory,
  );
  const systemMessage = getSystemMessageWithRules({
    baseSystemMessage: baseChatOrAgentSystemMessage,
    rules,
    userMessage: lastUserMsg,
    contextItems: lastUserContextItems,
  });

  if (systemMessage.trim()) {
    msgs.unshift({
      role: "system",
      content: systemMessage,
    });
  }

  // Remove the "id" from all of the messages
  return msgs.map((msg) => {
    const { id, ...rest } = msg as any;
    return rest;
  });
}
