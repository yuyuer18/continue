import {
  ContextItem,
  ContextProviderDescription,
  ContextProviderExtras,
} from "../../index.js";
import { BaseContextProvider } from "../index.js";

class SearchContextProvider extends BaseContextProvider {
  static description: ContextProviderDescription = {
    title: "search",
    displayTitle: "搜索",
    description: "使用 ripgrep 精确搜索工作区",
    type: "query",
    renderInlineAs: "",
  };

  async getContextItems(
    query: string,
    extras: ContextProviderExtras,
  ): Promise<ContextItem[]> {
    const results = await extras.ide.getSearchResults(query);
    return [
      {
        description: "Search results",
        content: `Results of searching codebase for "${query}":\n\n${results}`,
        name: "Search results",
      },
    ];
  }
}

export default SearchContextProvider;
