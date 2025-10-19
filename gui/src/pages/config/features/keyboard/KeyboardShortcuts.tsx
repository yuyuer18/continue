import { useMemo } from "react";
import Shortcut from "../../../../components/gui/Shortcut";
import { isJetBrains } from "../../../../util";

interface KeyboardShortcutProps {
  shortcut: string;
  description: string;
  isEven: boolean;
}

function KeyboardShortcut(props: KeyboardShortcutProps) {
  return (
    <div
      className={`flex flex-col items-start p-2 sm:flex-row sm:items-center ${props.isEven ? "" : "bg-table-oddRow"}`}
    >
      <div className="w-full flex-grow pb-1 pr-4 sm:w-auto sm:pb-0">
        <span className="block break-words text-xs">{props.description}:</span>
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
    description: "切换模型",
  },
  {
    shortcut: "cmd I",
    description: "编辑突出显示的代码",
  },
  {
    shortcut: "cmd L",
    description: "新聊天 / 使用选定代码的新聊天 / 关闭 侧边栏如果聊天已经聚焦",
  },
  {
    shortcut: "cmd backspace",
    description: "取消回复",
  },
  {
    shortcut: "cmd shift I",
    description: "切换内联编辑焦点",
  },
  {
    shortcut: "cmd shift L",
    description: "聚焦当前聊天 / 将所选代码添加到当前聊天 / 关闭侧边栏",
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
    description: "拒绝顶级差异更改",
  },
  {
    shortcut: "alt cmd Y",
    description: "接受顶级差异更改",
  },
  {
    shortcut: "cmd K cmd A",
    description: "切换自动补全已启用",
  },
  {
    shortcut: "cmd alt space",
    description: "Force an Autocomplete Trigger",
  },
  {
    shortcut: "cmd K cmd M",
    description: "切换全屏",
  },
];

const jetbrainsShortcuts: Omit<KeyboardShortcutProps, "isEven">[] = [
  {
    shortcut: "cmd '",
    description: "切换选择的模型",
  },
  {
    shortcut: "cmd I",
    description: "编辑选中代码",
  },
  {
    shortcut: "cmd J",
    description: "新对话(使用所选代码)/ 关闭侧边栏",
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
    description: "聚焦当前聊天 / 将所选代码添加到当前聊天 / 关闭侧边栏",
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

function KeyboardShortcuts() {
  const shortcuts = useMemo(() => {
    return isJetBrains() ? jetbrainsShortcuts : vscodeShortcuts;
  }, []);

  return (
    <div className="h-full overflow-auto">
      <h3 className="mb-3 text-xl">Keyboard shortcuts</h3>
      <div>
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
    </div>
  );
}

export default KeyboardShortcuts;
