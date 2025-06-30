import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class TerminalContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "terminal",
    displayTitle: "终端",
    description: "引用最后一个终端命令",
    type: "normal",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const content = await extras.ide.getTerminalContents();
    return [
      {
        description: "The contents of the terminal",
        content: `Current terminal contents:\n\n${
          content || "The terminal is empty."
        }`,
        name: "Terminal",
      },
    ];
  }
}

export default TerminalContextProvider;
