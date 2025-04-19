import {
  ChatHistoryItem,
  ChatMessage,
  RuleWithSource,
  TextMessagePart,
  UserChatMessage,
} from "../";
import { findLast } from "../util/findLast";
import { normalizeToMessageParts } from "../util/messageContent";
import { messageIsEmpty } from "./messages";
import { getSystemMessageWithRules } from "./rules/getSystemMessageWithRules";

export const DEFAULT_CHAT_SYSTEM_MESSAGE_URL =
  "https://github.com/continuedev/continue/blob/main/core/llm/constructMessages.ts#L8";

export const DEFAULT_CHAT_SYSTEM_MESSAGE = `\
<important_rules>
  采用中文进行回答，编写代码块时，请始终在信息字符串中包含语言和文件名.
  例如：在编辑 "src/main.py" 时, 在代码块中应该以开头 '\`\`\`python src/main.py'

 在处理代码修改请求时，提供一个简洁的代码片段，该片段只强调必要的更改，并对未修改的部分使用缩写的占位符。例如:
 :

  \`\`\`typescript /path/to/file
  // ... 其他代码 ...

  {{ 修改的代码 }}

  // ... 其他代码 ...

  {{ 其他修改代码 }}

  // ... 其他代码 ...
  \`\`\`

  由于用户可以访问他们的完整文件，他们更喜欢只阅读修改内容。
  使用这种 “偷懒” 的注释在文件的开头、中间或结尾省略未修改的部分是可以接受的。
  只有在明确请求时才提供完整的文件。除非用户明确要求只提供代码，否则应包括对更改的简要解释。
.
</important_rules>`;

const CANCELED_TOOL_CALL_MESSAGE =
  "This tool call was cancelled by the user. You should clarify next steps, as they don't wish for you to use this tool.";

export function constructMessages(
  history: ChatHistoryItem[],
  baseChatSystemMessage: string | undefined,
  rules: RuleWithSource[],
  modelName: string,
): ChatMessage[] {
  const filteredHistory = history.filter(
    (item) => item.message.role !== "system",
  );
  const msgs: ChatMessage[] = [];

  for (let i = 0; i < filteredHistory.length; i++) {
    const historyItem = filteredHistory[i];

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
    } else if (historyItem.toolCallState?.status === "canceled") {
      // Canceled tool call
      msgs.push({
        ...historyItem.message,
        content: CANCELED_TOOL_CALL_MESSAGE,
      });
    } else {
      msgs.push(historyItem.message);
    }
  }

  const userMessage = findLast(msgs, (msg) => msg.role === "user") as
    | UserChatMessage
    | undefined;
  const systemMessage = getSystemMessageWithRules({
    baseSystemMessage: baseChatSystemMessage ?? DEFAULT_CHAT_SYSTEM_MESSAGE,
    rules,
    userMessage,
    currentModel: modelName,
  });
  if (systemMessage.trim()) {
    msgs.unshift({
      role: "system",
      content: systemMessage,
    });
  }

  // We dispatch an empty assistant chat message to the history on submission. Don't send it
  const lastMessage = msgs.at(-1);
  if (
    lastMessage &&
    lastMessage.role === "assistant" &&
    messageIsEmpty(lastMessage)
  ) {
    msgs.pop();
  }

  // Remove the "id" from all of the messages
  return msgs.map((msg) => {
    const { id, ...rest } = msg as any;
    return rest;
  });
}
