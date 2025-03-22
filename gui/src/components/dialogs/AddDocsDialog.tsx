import {
  CheckIcon,
  InformationCircleIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { IndexingStatus, PackageDocsResult, SiteIndexingConfig } from "core";
import preIndexedDocs from "core/indexing/docs/preIndexedDocs";
import { usePostHog } from "posthog-js/react";
import { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Input, SecondaryButton } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppSelector } from "../../redux/hooks";
import { updateConfig } from "../../redux/slices/configSlice";
import { updateIndexingStatus } from "../../redux/slices/indexingSlice";
import { setDialogMessage, setShowDialog } from "../../redux/slices/uiSlice";
import FileIcon from "../FileIcon";
import { ToolTip } from "../gui/Tooltip";
import DocsIndexingPeeks from "../indexing/DocsIndexingPeeks";

function AddDocsDialog() {
  const config = useAppSelector((store) => store.config.config);
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

  const docsSuggestions = useAppSelector((store) => store.misc.docsSuggestions);
  const configDocs = useAppSelector((store) => store.config.config.docs);

  const sortedDocsSuggestions = useMemo(() => {
    const docsFromConfig = configDocs ?? [];
    // Don't show suggestions that are already in the config, indexing, and/or pre-indexed
    const filtered = docsSuggestions.filter((sug) => {
      const startUrl = sug.details?.docsLink;
      return (
        !docsFromConfig.find((d) => d.startUrl === startUrl) &&
        !docsIndexingStatuses.find((s) => s.id === startUrl) &&
        (startUrl ? !preIndexedDocs[startUrl] : true)
      );
    });

    filtered.sort((a, b) => {
      const rank = (result: PackageDocsResult) => {
        if (result.error) {
          return 2;
        } else if (result.details?.docsLinkWarning) {
          return 1;
        } else {
          return 0;
        }
      };
      return rank(a) - rank(b);
    });
    return filtered;
  }, [docsSuggestions, configDocs, docsIndexingStatuses]);

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

  const handleSelectSuggestion = (docsResult: PackageDocsResult) => {
    if (docsResult.error || !docsResult.details) {
      setTitle(docsResult.packageInfo.name);
      setStartUrl("");
      urlRef.current?.focus();
      return;
    }
    const suggestedTitle =
      docsResult.details.title ?? docsResult.packageInfo.name;

    if (docsResult.details?.docsLinkWarning) {
      setTitle(suggestedTitle);
      setStartUrl(docsResult.details.docsLink);
      urlRef.current?.focus();
      return;
    }
    const siteIndexingConfig: SiteIndexingConfig = {
      startUrl: docsResult.details.docsLink,
      title: suggestedTitle,
      faviconUrl: undefined,
    };

    ideMessenger.post("context/addDocs", siteIndexingConfig);

    posthog.capture("add_docs_gui", { url: startUrl });

    // Optimistic status update
    dispatch(
      updateConfig({
        ...config,
        docs: [
          ...(config.docs?.filter(
            (doc) => doc.startUrl !== docsResult.details.docsLink,
          ) ?? []),
          {
            startUrl: docsResult.details.docsLink,
            title: suggestedTitle,
            faviconUrl: undefined,
          },
        ],
      }),
      updateIndexingStatus({
        type: "docs",
        description: "Initializing",
        id: docsResult.details.docsLink,
        progress: 0,
        status: "indexing",
        title: docsResult.details.title ?? docsResult.packageInfo.name,
        url: docsResult.details.docsLink,
      }),
    );
  };

  return (
    <div className="px-2 pt-4 sm:px-4">
      <div className="">
        <h1 className="mb-0 hidden sm:block">增加文档索引</h1>
        <h1 className="sm:hidden">增加文档</h1>
        <p className="m-0 mt-2 p-0 text-stone-500">
          通过添加文档索引@docs，您可以在代码编辑器中搜索文档
        </p>
        {!!sortedDocsSuggestions.length && (
          <p className="m-0 mb-1 mt-4 p-0 font-semibold">建议的库</p>
        )}
        <div className="border-lightgray max-h-[145px] overflow-y-scroll rounded-sm py-1 pr-2">
          {sortedDocsSuggestions.map((docsResult) => {
            const { error, details } = docsResult;
            const { language, name, version } = docsResult.packageInfo;
            const id = `${language}-${name}-${version}`;
            return (
              <div
                key={id}
                className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] items-center px-1 py-1 hover:bg-gray-200/10"
                onClick={() => {
                  handleSelectSuggestion(docsResult);
                }}
              >
                <div className="pr-1">
                  {error || details?.docsLinkWarning ? (
                    <div>
                      <PencilIcon
                        data-tooltip-id={id + "-edit"}
                        className="text-lightgray h-3 w-3"
                      />
                      <ToolTip id={id + "-edit"} place="bottom">
                        这可能不是一个有效的文档链接
                      </ToolTip>
                    </div>
                  ) : (
                    <PlusIcon className="text-lightgray h-3.5 w-3.5" />
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <div className="hidden sm:block">
                    <FileIcon
                      filename={`x.${language}`}
                      height="1rem"
                      width="1rem"
                    />
                  </div>
                  <span className="lines lines-1">{name}</span>
                </div>
                <div>
                  {error || !details?.docsLink ? (
                    <span className="text-lightgray italic">
                      未找到文档链接
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      {/* <div>
                        <LinkIcon className="h-2 w-2" />
                      </div> */}
                      <p
                        className="lines lines-1 m-0 p-0 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          ideMessenger.post("openUrl", details.docsLink);
                        }}
                      >
                        {details.docsLink}
                      </p>
                    </div>
                  )}
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <InformationCircleIcon
                    data-tooltip-id={id + "-info"}
                    className="text-lightgray h-3.5 w-3.5 select-none"
                  />
                  <ToolTip id={id + "-info"} place="bottom">
                    <p className="m-0 p-0">{`Version: ${version}`}</p>
                    <p className="m-0 p-0">{`Found in ${docsResult.packageInfo.packageFile.path}`}</p>
                  </ToolTip>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <form onSubmit={onSubmit} className="flex flex-col gap-1">
            <div className="flex flex-row gap-2">
              <label className="flex min-w-16 basis-1/4 flex-col gap-1">
                <div className="flex flex-row items-center gap-1">
                  <span>标题</span>
                  <div>
                    <InformationCircleIcon
                      data-tooltip-id={"add-docs-form-title"}
                      className="text-lightgray h-3.5 w-3.5 select-none"
                    />
                    <ToolTip id={"add-docs-form-title"} place="top">
                      这标题将显示给用户在`@docs`子菜单中
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

              <label className="flex basis-3/4 flex-col gap-1">
                <div className="flex flex-row items-center gap-1">
                  <span className="lines lines-1 whitespace-nowrap">
                    URL地址
                  </span>
                  <div>
                    <InformationCircleIcon
                      data-tooltip-id={"add-docs-form-url"}
                      className="text-lightgray h-3.5 w-3.5 select-none"
                    />
                    <ToolTip id={"add-docs-form-url"} place="top">
                      这是文档的URL地址
                    </ToolTip>
                  </div>
                </div>
                <Input
                  ref={urlRef}
                  type="url"
                  placeholder="Start URL"
                  value={startUrl}
                  onChange={(e) => {
                    setStartUrl(e.target.value);
                  }}
                />
              </label>
              {/* <div>
                <PlusCircleIcon className="h-5 w-5 self-end" />
              </div> */}
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

      <DocsIndexingPeeks statuses={docsIndexingStatuses} />
      <div className="flex flex-row items-end justify-between pb-3">
        <div>
          {docsIndexingStatuses.length ? (
            <p className="mt-2 flex flex-row items-center gap-1 p-0 px-1 text-xs text-stone-500">
              <CheckIcon className="h-3 w-3" />
              在索引期间，可以关闭此窗口
            </p>
          ) : null}
        </div>
        {/* <Button className="min-w-16" onClick={closeDialog}>
          Done
        </Button> */}
      </div>
    </div>
  );
}

export default AddDocsDialog;
