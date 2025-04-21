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
    const diff = await extras.ide.getDiff(
      this.options?.includeUnstaged ?? true,
    );
    return [
      {
        description: "当前的文件的 Git 差异",
        content:
          diff.length === 0
            ? "Git shows no current changes."
            : `\`\`\`git diff\n${diff.join("\n")}\n\`\`\``,
        name: "Git Diff",
      },
    ];
  }
}

export default DiffContextProvider;
