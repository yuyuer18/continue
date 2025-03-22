import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { IndexingStatus } from "core";
import { useContext, useMemo } from "react";
import { useDispatch } from "react-redux";
import { SecondaryButton } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppSelector } from "../../redux/hooks";
import { setDialogMessage, setShowDialog } from "../../redux/slices/uiSlice";
import AddDocsDialog from "../dialogs/AddDocsDialog";
import DocsIndexingStatus from "./DocsIndexingStatus";

function DocsIndexingStatuses() {
  const dispatch = useDispatch();
  const config = useAppSelector((store) => store.config.config);
  const ideMessenger = useContext(IdeMessengerContext);
  const indexingStatuses = useAppSelector(
    (store) => store.indexing.indexing.statuses,
  );

  const hasDocsProvider = useMemo(() => {
    return !!config.contextProviders?.some(
      (provider) => provider.title === "docs",
    );
  }, [config]);

  // TODO - this might significantly impact performance during indexing
  const sortedConfigDocs = useMemo(() => {
    const sorter = (status: IndexingStatus["status"]) => {
      // TODO - further sorting?
      if (status === "indexing" || status === "paused") return 0;
      if (status === "failed") return 1;
      if (status === "aborted" || status === "pending") return 2;
      return 3;
    };

    const docs = [...(config.docs ?? [])];
    docs.sort((a, b) =>
      sorter(indexingStatuses[b.startUrl]?.status ?? "pending") >
      sorter(indexingStatuses[a.startUrl]?.status ?? "pending")
        ? -1
        : 1,
    );
    return docs;
  }, [config, indexingStatuses]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row items-center justify-between">
        <h3 className="mb-0 mt-0 text-xl">文档索引 @docs index</h3>
        {sortedConfigDocs.length ? (
          <SecondaryButton
            className="!my-0 flex h-7 flex-col items-center justify-center"
            onClick={() => {
              dispatch(setShowDialog(true));
              dispatch(setDialogMessage(<AddDocsDialog />));
            }}
          >
            增加
          </SecondaryButton>
        ) : null}
      </div>
      <span className="text-xs text-stone-500">
        {hasDocsProvider ? (
          sortedConfigDocs.length ? (
            "管理你的文档索引"
          ) : (
            "无文档索引"
          )
        ) : (
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex flex-row gap-1">
              <div>
                <ExclamationTriangleIcon className="h-4 w-4 text-stone-500" />
              </div>
              <span className="text-stone-500">
                  @doc 不在你的配置中
              </span>
            </div>
            <span
              className="cursor-pointer text-stone-500 underline"
              onClick={() => {
                ideMessenger.post("config/addContextProvider", {
                  name: "docs",
                  params: {},
                });
              }}
              >
                增加 @docs 到我的配置
            </span>
          </div>
        )}
      </span>
      <div className="flex max-h-[170px] flex-col gap-1 overflow-y-auto overflow-x-hidden pr-2">
        <div>
          {sortedConfigDocs.length === 0 && (
            <SecondaryButton
              className="flex h-7 flex-col items-center justify-center"
              onClick={() => {
                dispatch(setShowDialog(true));
                dispatch(setDialogMessage(<AddDocsDialog />));
              }}
            >
              增加文档索引
            </SecondaryButton>
          )}
        </div>
        {sortedConfigDocs.map((doc) => {
          return <DocsIndexingStatus key={doc.startUrl} docConfig={doc} />;
        })}
      </div>
    </div>
  );
}

export default DocsIndexingStatuses;
