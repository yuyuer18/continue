import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { IndexingStatus, SiteIndexingConfig } from "core";
import { usePostHog } from "posthog-js/react";
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Input, SecondaryButton } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import DocsIndexingPeeks from "../../pages/config/sections/docs/DocsIndexingPeeks";
import { useAppSelector } from "../../redux/hooks";
import { updateIndexingStatus } from "../../redux/slices/indexingSlice";
import { setDialogMessage, setShowDialog } from "../../redux/slices/uiSlice";
import { ToolTip } from "../gui/Tooltip";

function AddDocsDialog() {
  const posthog = usePostHog();
  const dispatch = useDispatch();

  const titleRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [startUrl, setStartUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  const ideMessenger = useContext(IdeMessengerContext);
  const indexingStatuses = useAppSelector(
    (store) => store.indexing.indexing.statuses,
  );

  const docsIndexingStatuses: IndexingStatus[] = useMemo(() => {
    return Object.values(indexingStatuses).filter(
      (status) => status.type === "docs" && status.status === "indexing",
    );
  }, [indexingStatuses]);

  const isFormValid = startUrl && title;

  useLayoutEffect(() => {
    setTimeout(() => {
      if (titleRef.current) {
        titleRef.current.focus();
      }
    }, 100);
  }, [titleRef]);

  const closeDialog = () => {
    dispatch(setShowDialog(false));
    dispatch(setDialogMessage(undefined));
  };

  function onSubmit(e: any) {
    e.preventDefault();

    const siteIndexingConfig: SiteIndexingConfig = {
      startUrl,
      title,
      faviconUrl,
    };

    ideMessenger.post("context/addDocs", siteIndexingConfig);

    setTitle("");
    setStartUrl("");
    setFaviconUrl("");

    posthog.capture("add_docs_gui", { url: startUrl });

    // Optimistic status update
    dispatch(
      updateIndexingStatus({
        type: "docs",
        description: "Initializing",
        id: startUrl,
        progress: 0,
        status: "indexing",
        title,
        url: startUrl,
      }),
    );
  }

  return (
    <div className="px-2 pt-4 sm:px-4">
      <div className="">
        <h1 className="mb-0 hidden sm:block">增加文档索引</h1>
        <h1 className="sm:hidden">增加文档</h1>
        <p className="m-0 mt-2 p-0 text-stone-500">
          通过添加文档索引@docs，您可以在代码编辑器中搜索文档
        </p>
        <div className="mt-3">
          <form onSubmit={onSubmit} className="flex flex-col gap-1">
            <div className="flex flex-col gap-2">
              <label className="flex w-full flex-col gap-1">
                <div className="flex flex-row items-center gap-1">
                  <span>标题</span>
                  <div>
                    <ToolTip place="top" content="文档的标题，用于显示在IDE中">
                      <InformationCircleIcon className="text-lightgray h-3.5 w-3.5 select-none" />
                    </ToolTip>
                  </div>
                </div>

                <Input
                  type="text"
                  placeholder="请输入标题"
                  value={title}
                  ref={titleRef}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>

              <label className="flex w-full flex-col gap-1">
                <div className="flex flex-row items-center gap-1">
                  <span className="line-clamp-1 whitespace-nowrap">
                    URL地址
                  </span>
                  <div>
                    <ToolTip place="top" content="开始爬取文档网站的起始位置">
                      <InformationCircleIcon className="text-lightgray h-3.5 w-3.5 select-none" />
                    </ToolTip>
                  </div>
                </div>
                <Input
                  ref={urlRef}
                  type="url"
                  placeholder="URL"
                  value={startUrl}
                  onChange={(e) => {
                    setStartUrl(e.target.value);
                  }}
                />
              </label>
            </div>
            <div className="flex flex-row justify-end gap-2">
              <SecondaryButton
                className="min-w-16"
                disabled={!isFormValid}
                type="submit"
              >
                添加
              </SecondaryButton>
            </div>
          </form>
        </div>
      </div>

      {docsIndexingStatuses.length > 0 && (
        <>
          <DocsIndexingPeeks statuses={docsIndexingStatuses} />
          <p className="mt-2 flex flex-row items-center gap-1 p-0 px-1 text-center text-xs text-stone-500">
            关闭此对话框不会影响索引进度
          </p>
        </>
      )}
    </div>
  );
}

export default AddDocsDialog;
