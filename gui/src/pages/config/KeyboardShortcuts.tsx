import { useMemo } from "react";
import styled from "styled-components";
import {
  defaultBorderRadius,
  lightGray,
  vscForeground,
} from "../../components";
import { ToolTip } from "../../components/gui/Tooltip";
import { getPlatform, isJetBrains } from "../../util";

const StyledKeyDiv = styled.div`
  border: 0.5px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 2px;
  color: ${vscForeground};

  width: 16px;
  height: 16px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const keyToName: { [key: string]: string } = {
  "⌘": "Cmd",
  "⌃": "Ctrl",
  "⇧": "Shift",
  "⏎": "Enter",
  "⌫": "Backspace",
  "⌥": "Option",
  "⎇": "Alt",
};

function KeyDiv({ text }: { text: string }) {
  return (
    <>
      <StyledKeyDiv data-tooltip-id={`header_button_${text}`}>
        {text}
      </StyledKeyDiv>

      <ToolTip id={`header_button_${text}`} place="bottom">
        {keyToName[text]}
      </ToolTip>
    </>
  );
}

interface KeyboardShortcutProps {
  mac: string;
  windows: string;
  description: string;
}

function KeyboardShortcut(props: KeyboardShortcutProps) {
  const shortcut = getPlatform() === "mac" ? props.mac : props.windows;
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-1">
      <span className="max-w-60 text-xs">{props.description}:</span>
      <div className="flex flex-1 flex-row items-center justify-end gap-1.5">
        {shortcut.split(" ").map((key, i) => {
          return <KeyDiv key={i} text={key}></KeyDiv>;
        })}
      </div>
    </div>
  );
}

const vscodeShortcuts: KeyboardShortcutProps[] = [
  {
    mac: "⌘ '",
    windows: "⌃ '",
    description: "切换模型",
  },
  {
    mac: "⌘ I",
    windows: "⌃ I",
    description: "编辑高亮代码",
  },
  {
    mac: "⌘ L",
    windows: "⌃ L",
    description:
      "新聊天 / 使用选定代码的新聊天 / 关闭 侧边栏如果聊天已经聚焦",
  },
  {
    mac: "⌘ ⌫",
    windows: "⌃ ⌫",
    description: "取消响应",
  },
  {
    mac: "⌘ ⇧ I",
    windows: "⌃ ⇧ I",
    description: "切换内联编辑焦点",
  },
  {
    mac: "⌘ ⇧ L",
    windows: "⌃ ⇧ L",
    description:
      "聚焦当前聊天 / 将所选代码添加到当前聊天 / 关闭侧边栏",
  },
  {
    mac: "⌘ ⇧ R",
    windows: "⌃ ⇧ R",
    description: "调试终端",
  },
  {
    mac: "⌘ ⇧ ⌫",
    windows: "⌃ ⇧ ⌫",
    description: "拒绝代码差异",
  },
  {
    mac: "⌘ ⇧ ⏎",
    windows: "⌃ ⇧ ⏎",
    description: "接受代码差异",
  },
  {
    mac: "⌥ ⌘ N",
    windows: "Alt ⌃ N",
    description: "拒绝顶部差异更改",
  },
  {
    mac: "⌥ ⌘ Y",
    windows: "Alt ⌃ Y",
    description: "接受顶部差异更改",
  },
  {
    mac: "⌘ K ⌘ A",
    windows: "⌃ K ⌃ A",
    description: "切换自动补全启用状态",
  },
  {
    mac: "⌘ K ⌘ M",
    windows: "⌃ K ⌃ M",
    description: "切换全屏",
  },
];

const jetbrainsShortcuts: KeyboardShortcutProps[] = [
  {
    mac: "⌘ '",
    windows: "⌃ '",
    description: "切换模型",
  },
  {
    mac: "⌘ I",
    windows: "⌃ I",
    description: "编辑高亮代码",
  },
  {
    mac: "⌘ J",
    windows: "⌃ J",
    description:
      "新对话(使用所选代码)/ 关闭侧边栏",
  },
  {
    mac: "⌘ ⌫",
    windows: "⌃ ⌫",
    description: "取消响应",
  },
  {
    mac: "⌘ ⇧ I",
    windows: "⌃ ⇧ I",
    description: "切换内联编辑焦点",
  },
  {
    mac: "⌘ ⇧ J",
    windows: "⌃ ⇧ J",
    description:
      "聚焦当前聊天 / 将所选代码添加到当前聊天 / 关闭侧边栏",
  },
  {
    mac: "⌘ ⇧ ⌫",
    windows: "⌃ ⇧ ⌫",
    description: "拒绝代码差异",
  },
  {
    mac: "⌘ ⇧ ⏎",
    windows: "⌃ ⇧ ⏎",
    description: "接受代码差异",
  },
  {
    mac: "⌥ ⇧ J",
    windows: "Alt ⇧ J",
    description: "快速聚焦当前聊天",
  },
  {
    mac: "⌥ ⌘ J",
    windows: "Alt ⌃ J",
    description: "关闭当前聊天",
  },
];

function KeyboardShortcuts() {
  const shortcuts = useMemo(() => {
    return isJetBrains() ? jetbrainsShortcuts : vscodeShortcuts;
  }, []);

  return (
    <div className="flex max-w-[400px] flex-col">
      <h3 className="mb-2 text-xl">快捷键</h3>
      <div className="flex flex-col items-center justify-center gap-x-3 gap-y-3 p-1">
        {shortcuts.map((shortcut, i) => {
          return (
            <KeyboardShortcut
              key={i}
              mac={shortcut.mac}
              windows={shortcut.windows}
              description={shortcut.description}
            />
          );
        })}
      </div>
    </div>
  );
}

export default KeyboardShortcuts;
