import { ToolImpl } from ".";
import { formatGrepSearchResults } from "../../util/grepSearch";

export const grepSearchImpl: ToolImpl = async (args, extras) => {
  const results = await extras.ide.getSearchResults(args.query);
  return [
    {
      name: "搜索结果",
      description: "grep 搜索结果",
      content: formatGrepSearchResults(results),
    },
  ];
};
