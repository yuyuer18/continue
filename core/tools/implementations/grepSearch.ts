import { ToolImpl } from ".";
import { ContextItem } from "../..";
import { formatGrepSearchResults } from "../../util/grepSearch";

const DEFAULT_GREP_SEARCH_RESULTS_LIMIT = 100;
const DEFAULT_GREP_SEARCH_CHAR_LIMIT = 5000; // ~1000 tokens, will keep truncation simply for now

export const grepSearchImpl: ToolImpl = async (args, extras) => {
  const results = await extras.ide.getSearchResults(
    args.query,
    DEFAULT_GREP_SEARCH_RESULTS_LIMIT,
  );
  const { formatted, numResults, truncated } = formatGrepSearchResults(
    results,
    DEFAULT_GREP_SEARCH_CHAR_LIMIT,
  );
  const truncationReasons: string[] = [];
  if (numResults === DEFAULT_GREP_SEARCH_RESULTS_LIMIT) {
    truncationReasons.push(
      `the number of results exceeded ${DEFAULT_GREP_SEARCH_RESULTS_LIMIT}`,
    );
  }
  if (truncated) {
    truncationReasons.push(
      `the number of characters exceeded ${DEFAULT_GREP_SEARCH_CHAR_LIMIT}`,
    );
  }

  const contextItems: ContextItem[] = [
    {
      name: "搜索结果",
      description: "结果来自 ripgrep 搜索",
      content: formatted,
    },
  ];
  if (truncationReasons.length > 0) {
    contextItems.push({
      name: "搜索结果截断说明",
      description: "通知模型搜索结果已被截断",
      content: `上述搜索结果被截断，原因是 ${truncationReasons.join(" and ")}. 如果结果不尽人意，可以尝试优化你的搜索查询.`,
    });
  }
  return contextItems;
};
