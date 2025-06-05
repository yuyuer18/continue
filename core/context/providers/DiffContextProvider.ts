import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class DiffContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "diff",
    displayTitle: "Git Diff",
    description: "引用当前文件的Git差异",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const includeUnstaged = this.options?.includeUnstaged ?? true;
    const diffs = await extras.ide.getDiff(includeUnstaged); // TODO use diff cache (currently cache always includes unstaged)
    return [
      {
        description: "当前的文件的 Git 差异",
        content:
          diffs.length === 0
            ? "Git shows no current changes."
            : `\`\`\`git diff\n${diffs.join("\n")}\n\`\`\``,
        name: "Git Diff",
      },
    ];
  }
}

export default DiffContextProvider;
