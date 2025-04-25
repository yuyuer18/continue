import {
  ChatHistoryItem,
  ChatMessage,
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

export const DEFAULT_CHAT_SYSTEM_MESSAGE = `\
<important_rules>
  采用中文进行回答，编写代码块时，请始终在信息字符串中包含语言和文件名.
  例如：在编辑 "src/main.py" 时, 在代码块中应该以开头 '\`\`\`python src/main.py'

 在处理代码修改请求时，提供一个简洁的代码片段，该片段只强调必要的更改，并对未修改的部分使用缩写的占位符。例如:

  \`\`\`language /path/to/file
  // ... rest of code here ...

  {{ 修改的代码 }}

  // ... 其他代码 ...

  {{ 其他修改代码 }}

  // ... 其他代码 ...
  \`\`\`

  在现有文件中，你应该重述代码片段所属的函数或类:

  \`\`\`language /path/to/file
  // ... 其他代码 ...
  
  function exampleFunction() {
    // ... 其他代码 ...
    
    {{ modified code here }}
    
    // ... 其他代码 ...
  }
  
  // ... 其他代码 ...
  \`\`\`

  由于用户可以访问其完整文件，他们更喜欢仅阅读相关的修改内容。
  使用这些 “懒惰” 的注释在文件的开头、中间或结尾处省略未修改的部分是完全可以接受的。
  仅在明确请求时提供完整文件。除非用户明确要求仅提供代码，否则请包含对更改的简要说明。
.
</important_rules>`;

export function constructMessages(
  history: ChatHistoryItem[],
  baseChatSystemMessage: string | undefined,
  rules: RuleWithSource[],
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
    } else {
      msgs.push(historyItem.message);
    }
  }

  const lastUserMsg = findLast(msgs, isUserOrToolMsg) as
    | UserChatMessage
    | ToolResultChatMessage
    | undefined;

  const systemMessage = getSystemMessageWithRules({
    baseSystemMessage: baseChatSystemMessage ?? DEFAULT_CHAT_SYSTEM_MESSAGE,
    rules,
    userMessage: lastUserMsg,
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
