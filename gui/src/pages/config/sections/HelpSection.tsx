import {
  DocumentArrowUpIcon,
  LinkIcon,
  NumberedListIcon,
  PaintBrushIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Shortcut from "../../../components/gui/Shortcut";
import { Card } from "../../../components/ui";
import { IdeMessengerContext } from "../../../context/IdeMessenger";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setOnboardingCard } from "../../../redux/slices/uiSlice";
import { saveCurrentSession } from "../../../redux/thunks/session";
import { isJetBrains } from "../../../util";
import { ROUTES } from "../../../util/navigation";
import { ConfigHeader } from "../components/ConfigHeader";
import { ConfigRow } from "../components/ConfigRow";

interface KeyboardShortcutProps {
  shortcut: string;
  description: string;
  isEven: boolean;
}

function KeyboardShortcut(props: KeyboardShortcutProps) {
  return (
    <div
      className={`flex flex-col items-start p-3 sm:flex-row sm:items-center ${props.isEven ? "" : "bg-vsc-editor-background/50"}`}
    >
      <div className="w-full flex-grow pb-2 pr-4 sm:w-auto sm:pb-0">
        <span className="block break-words text-sm">{props.description}:</span>
      </div>
      <div className="flex-shrink-0 whitespace-nowrap">
        <Shortcut>{props.shortcut}</Shortcut>
      </div>
    </div>
  );
}

// Shortcut strings will be rendered correctly based on the platform by the Shortcut component
const vscodeShortcuts: Omit<KeyboardShortcutProps, "isEven">[] = [
  {
    shortcut: "cmd '",
    description: "切换选定的模型",
  },
  {
    shortcut: "cmd I",
    description: "编辑高亮代码",
  },
  {
    shortcut: "cmd L",
    description:
      "新聊天 / 使用选定代码的新聊天 / 如果聊天已聚焦则关闭 Continue 侧边栏",
  },
  {
    shortcut: "cmd backspace",
    description: "取消响应",
  },
  {
    shortcut: "cmd shift I",
    description: "切换内联编辑焦点",
  },
  {
    shortcut: "cmd shift L",
    description:
      "聚焦当前聊天 / 将选定代码添加到当前聊天 / 如果聊天已聚焦则关闭 Continue 侧边栏",
  },
  {
    shortcut: "cmd shift R",
    description: "调试终端",
  },
  {
    shortcut: "cmd shift backspace",
    description: "拒绝差异",
  },
  {
    shortcut: "cmd shift enter",
    description: "接受差异",
  },
  {
    shortcut: "alt cmd N",
    description: "拒绝差异中的顶部更改",
  },
  {
    shortcut: "alt cmd Y",
    description: "接受差异中的顶部更改",
  },
  {
    shortcut: "cmd K cmd A",
    description: "切换自动补全启用状态",
  },
  {
    shortcut: "cmd alt space",
    description: "强制触发自动补全",
  },
  {
    shortcut: "cmd K cmd M",
    description: "切换全屏",
  },
];

const jetbrainsShortcuts: Omit<KeyboardShortcutProps, "isEven">[] = [
  {
    shortcut: "cmd '",
    description: "切换选定的模型",
  },
  {
    shortcut: "cmd I",
    description: "编辑高亮代码",
  },
  {
    shortcut: "cmd J",
    description:
      "新聊天 / 使用选定代码的新聊天 / 如果聊天已聚焦则关闭 Continue 侧边栏",
  },
  {
    shortcut: "cmd backspace",
    description: "取消响应",
  },
  {
    shortcut: "cmd shift I",
    description: "切换内联编辑焦点",
  },
  {
    shortcut: "cmd shift J",
    description:
      "聚焦当前聊天 / 将选定代码添加到当前聊天 / 如果聊天已聚焦则关闭 Continue 侧边栏",
  },
  {
    shortcut: "cmd shift backspace",
    description: "拒绝差异",
  },
  {
    shortcut: "cmd shift enter",
    description: "接受差异",
  },
  {
    shortcut: "alt shift J",
    description: "快速输入",
  },
  {
    shortcut: "alt cmd J",
    description: "切换侧边栏",
  },
];

export function HelpSection() {
  const ideMessenger = useContext(IdeMessengerContext);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const currentSession = useAppSelector((state) => state.session);

  const shortcuts = useMemo(() => {
    return isJetBrains() ? jetbrainsShortcuts : vscodeShortcuts;
  }, []);

  const handleViewSessionData = async () => {
    const sessionData = await ideMessenger.request("history/load", {
      id: currentSession.id,
    });

    if (sessionData.status === "success") {
      await ideMessenger.request("showVirtualFile", {
        name: `${sessionData.content.title}.json`,
        content: JSON.stringify(sessionData.content, null, 2),
      });
    }
  };

  return (
    <div className="flex flex-col">
      <ConfigHeader title="帮助中心" />
      <div className="space-y-6">
        {/* Resources */}
        <div>
          <h3 className="mb-3 text-base font-medium">资源</h3>
          <Card className="!p-0">
            <div className="flex flex-col">
              <ConfigRow
                title="Continue Hub"
                description="访问 hub.continue.dev 探索自定义代理和模块"
                icon={LinkIcon}
                onClick={() =>
                  ideMessenger.post("openUrl", "https://hub.continue.dev/")
                }
              />

              <ConfigRow
                title="文档"
                description="学习如何配置和使用 Continue"
                icon={LinkIcon}
                onClick={() =>
                  ideMessenger.post("openUrl", "https://docs.continue.dev/")
                }
              />

              <ConfigRow
                title="遇到问题？"
                description="在 GitHub 上告诉我们，我们会尽力解决"
                icon={LinkIcon}
                onClick={() =>
                  ideMessenger.post(
                    "openUrl",
                    "https://github.com/continuedev/continue/issues/new/choose",
                  )
                }
              />

              <ConfigRow
                title="加入社区！"
                description="加入我们的 Discord，了解最新动态"
                icon={LinkIcon}
                onClick={() =>
                  ideMessenger.post("openUrl", "https://discord.gg/vapESyrFmJ")
                }
              />
            </div>
          </Card>
        </div>

        {/* Tools */}
        <div>
          <h3 className="mb-3 text-base font-medium">工具</h3>
          <Card className="!p-0">
            <div className="flex flex-col">
              <ConfigRow
                title="令牌使用情况"
                description="各模型的每日令牌使用情况"
                icon={TableCellsIcon}
                onClick={() => navigate(ROUTES.STATS)}
              />

              {currentSession.history.length > 0 &&
                !currentSession.isStreaming && (
                  <ConfigRow
                    title="View current session history"
                    description="Open the current chat session file for troubleshooting"
                    icon={NumberedListIcon}
                    onClick={handleViewSessionData}
                  />
                )}

              <ConfigRow
                title="快速入门"
                description="重新打开快速入门和教程文件"
                icon={DocumentArrowUpIcon}
                onClick={async () => {
                  navigate("/");
                  // Used to clear the chat panel before showing onboarding card
                  await dispatch(
                    saveCurrentSession({
                      openNewSession: true,
                      generateTitle: true,
                    }),
                  );
                  dispatch(
                    setOnboardingCard({
                      show: true,
                      activeTab: undefined,
                    }),
                  );
                  ideMessenger.post("showTutorial", undefined);
                }}
              />

              {process.env.NODE_ENV === "development" && (
                <ConfigRow
                  title="Theme Test Page"
                  description="Development page for testing themes"
                  icon={PaintBrushIcon}
                  onClick={async () => {
                    navigate(ROUTES.THEME);
                  }}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <h3 className="mb-3 text-base font-medium">键盘快捷键</h3>
          <Card className="!p-0">
            <div className="overflow-hidden rounded-md border border-gray-600">
              {shortcuts.map((shortcut, i) => {
                return (
                  <KeyboardShortcut
                    key={i}
                    shortcut={shortcut.shortcut}
                    description={shortcut.description}
                    isEven={i % 2 === 0}
                  />
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
