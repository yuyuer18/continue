import {
  ArrowTopRightOnSquareIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import DocsIndexingStatuses from "../../components/indexing/DocsIndexingStatuses";
import PageHeader from "../../components/PageHeader";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useNavigationListener } from "../../hooks/useNavigationListener";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setOnboardingCard } from "../../redux/slices/uiSlice";
import { saveCurrentSession } from "../../redux/thunks/session";
import { AccountButton } from "../config/AccountButton";
import IndexingProgress from "./IndexingProgress";
import KeyboardShortcuts from "./KeyboardShortcuts";
import MoreHelpRow from "./MoreHelpRow";
import { RulesPreview } from "./RulesPreview";

function MorePage() {
  useNavigationListener();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);
  const config = useAppSelector((store) => store.config.config);
  const { disableIndexing } = config;

  return (
    <div className="overflow-y-scroll">
      <PageHeader
        showBorder
        onTitleClick={() => navigate("/")}
        title="对话"
        rightContent={<AccountButton />}
      />

      <div className="gap-2 divide-x-0 divide-y-2 divide-solid divide-zinc-700 px-4">
        <div className="py-5">
          <div>
            <h3 className="mx-auto mb-1 mt-0 text-xl">@代码库索引</h3>
            <span className="w-3/4 text-xs text-stone-500">
              本地代码库索引的状态
            </span>
          </div>
          {disableIndexing ? (
            <div className="pb-2 pt-5">
              <p className="py-1 text-center font-semibold">
                索引处于禁用状态
              </p>
              <p className="text-lightgray cursor-pointer text-center text-xs">
                打开助手配置并切换 <code>禁用索引</code> 以重新启用
              </p>
            </div>
          ) : (
            <IndexingProgress />
          )}
        </div>

        <div className="flex flex-col py-5">
          <DocsIndexingStatuses />
        </div>

        <div className="flex flex-col py-5">
          <RulesPreview />
        </div>

        <div className="py-5">
          <h3 className="mb-4 mt-0 text-xl">帮助中心</h3>
          <div className="-mx-4 flex flex-col">
            <MoreHelpRow
              title="文档"
              description="学习如何配置使用Kodemate AI"
              Icon={ArrowTopRightOnSquareIcon}
              onClick={() =>
                ideMessenger.post("openUrl", "https://home.amarsoft.com/")
              }
            />

            <MoreHelpRow
              title="使用有问题?"
              description="打开EIP进行产品问题登记，我们会尽最大努力解决这个问题。"
              Icon={ArrowTopRightOnSquareIcon}
              onClick={() =>
                ideMessenger.post(
                  "openUrl",
                  "https://home.amarsoft.com",
                )
              }
            />

            <MoreHelpRow
              title="加入我们!"
              description="加入我们的团队，了解最新的Kodemate AI发展"
              Icon={ArrowTopRightOnSquareIcon}
              onClick={() =>
                ideMessenger.post("openUrl", "https://home.amarsoft.com/")
              }
            />

            <MoreHelpRow
              title="Token 使用量"
              description="模型的每日使用情况"
              Icon={TableCellsIcon}
              onClick={() => navigate("/stats")}
            />

            <MoreHelpRow
              title="快速开始"
              description="重新打开快速入门和教程文件"
              Icon={DocumentArrowUpIcon}
              onClick={async () => {
                navigate("/");
                // Used to clear the chat panel before showing onboarding card
                await dispatch(
                  saveCurrentSession({
                    openNewSession: true,
                    generateTitle: true,
                  }),
                );
                dispatch(setOnboardingCard({ show: true, activeTab: "Best" }));
                ideMessenger.post("showTutorial", undefined);
              }}
            />
          </div>
        </div>

        <div>
          <h3 className="mx-auto mb-1 text-lg">键盘快捷键</h3>
          <KeyboardShortcuts />
        </div>
      </div>
    </div>
  );
}

export default MorePage;
