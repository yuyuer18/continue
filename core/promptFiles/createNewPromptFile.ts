import { IDE } from "..";
import { GlobalContext } from "../util/GlobalContext";
import { joinPathsToUri } from "../util/uri";

const FIRST_TIME_DEFAULT_PROMPT_FILE = `这是一个示例 ".prompt" 文件
# 它用于在 Kodemate AI 中定义和重用提示
# 每个 .prompt 文件都可以通过在聊天输入框中输入 "@prompts" 来访问

# 一个提示文件由两部分组成：
# 1. "---" 以上的部分是 YAML 格式。在这里你可以设置 "temperature"（温度）、"description"（描述）和其他选项
# 2. "---" 以下的部分是提示内容

# 如果你不想设置任何选项，则不需要包含 "---"

# 在提示内容中，你可以引用：
# 1. 文件，可以使用绝对路径或相对路径（基于工作区根目录）
  # @README.md
  # @src/test/test.py
  # @/Users/me/Desktop/my-project/src/test/test.py
# 2. URL，例如
  # @https://example.com
# 3. 上下文提供者，例如
  # @currentFile
  # @os
  # @repo-map

# 要了解更多信息，请参阅完整的 .prompt 文件示例：
名称：示例
描述：示例提示文件
---

以下是关于当前仓库的信息：

@README.md`;

const DEFAULT_PROMPT_FILE = "";

export async function createNewPromptFileV2(
  ide: IDE,
  promptPath: string | undefined,
): Promise<void> {
  const workspaceDirs = await ide.getWorkspaceDirs();
  if (workspaceDirs.length === 0) {
    throw new Error(
      "No workspace directories found. Make sure you've opened a folder in your IDE.",
    );
  }

  const baseDirUri = joinPathsToUri(
    workspaceDirs[0],
    promptPath ?? ".continue/prompts",
  );

  // Find the first available filename
  let counter = 0;
  let promptFileUri: string;
  do {
    const suffix = counter === 0 ? "" : `-${counter}`;
    promptFileUri = joinPathsToUri(
      baseDirUri,
      `new-prompt-file${suffix}.prompt`,
    );
    counter++;
  } while (await ide.fileExists(promptFileUri));

  const globalContext = new GlobalContext();
  const PROMPT_FILE =
    globalContext.get("hasAlreadyCreatedAPromptFile") === true
      ? DEFAULT_PROMPT_FILE
      : FIRST_TIME_DEFAULT_PROMPT_FILE;

  globalContext.update("hasAlreadyCreatedAPromptFile", true);

  await ide.writeFile(promptFileUri, PROMPT_FILE);
  await ide.openFile(promptFileUri);
}
