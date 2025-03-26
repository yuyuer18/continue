import { useAppSelector } from "../../redux/hooks";
import IndexingProgress from "./IndexingProgress";

export function IndexingSettingsSection() {
  const config = useAppSelector((state) => state.config.config);
  return (
    <div className="py-5">
      <div>
        <h3 className="mx-auto mb-1 mt-0 text-xl">@codebase index</h3>
        <span className="text-lightgray w-3/4 text-xs">
         本地文件索引，用于提供代码补全和搜索功能
        </span>
      </div>
      {config.disableIndexing ? (
        <div className="pb-2 pt-5">
          <p className="py-1 text-center font-semibold">已禁用索引</p>
          <p className="text-lightgray cursor-pointer text-center text-xs">
            打开设置并切换<code>禁用索引</code>以重新启用
          </p>
        </div>
      ) : (
        <IndexingProgress />
      )}
    </div>
  );
}
