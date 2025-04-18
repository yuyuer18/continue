import { BlockType } from "@continuedev/config-yaml";
import {
  ArrowTopRightOnSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { GhostButton } from "../../..";
import { useAuth } from "../../../../context/Auth";
import { IdeMessengerContext } from "../../../../context/IdeMessenger";
import { useAppDispatch } from "../../../../redux/hooks";
import { fontSize } from "../../../../util";

export function ExploreBlocksButton(props: { blockType: string }) {
  const { selectedProfile } = useAuth();
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useAppDispatch();

  const isLocal = selectedProfile?.profileType === "local";

  const Icon = isLocal ? PlusIcon : ArrowTopRightOnSquareIcon;
  const getBlockName = (blockType: string) => {
    switch (blockType) {
      case "docs":
        return "docs";
      case "MCP servers":
        return "MCP服务";
      case "Prompts":
        return "提示词";
      case "models":
        return "";
      default:
        return "API文档";
    }
  };

  const text = `${isLocal ? "添加" : "Explore"} ${
    props.blockType === "mcpServers"
      ? "MCP 服务"
      : getBlockName(
          props.blockType.charAt(0).toUpperCase() + props.blockType.slice(1),
        )
  }`;

  const handleClick = () => {
    if (isLocal) {
      ideMessenger.request("config/addLocalWorkspaceBlock", {
        blockType: props.blockType as BlockType,
      });
      switch (props.blockType) {
        case "prompts": // 新增提示词
          ideMessenger.post("handleGeneratePrompt", {
            fileName: "random",
            prompts: `name: 提示词主题\ndescription: 提示词描述\n---\n该程序请采用Vue2+ElementUI架构\n表单使用a3-ow-info组件`,
          });
          break;
      }
      // switch (props.blockType) {
      //   case "docs":
      //     dispatch(setShowDialog(true));
      //     dispatch(setDialogMessage(<AddDocsDialog />));
      //     break;
      //   default:
      //     ideMessenger.request("config/openProfile", {
      //       profileId: selectedProfile.id,
      //     });
      // }
    } else {
      ideMessenger.request("controlPlane/openUrl", {
        path: `new?type=block&blockType=${props.blockType}`,
        orgSlug: undefined,
      });
    }
  };

  return (
    <GhostButton
      className="w-full cursor-pointer rounded px-2 py-0.5 text-center text-gray-400 hover:text-gray-300"
      style={{
        fontSize: fontSize(-3),
      }}
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <Icon className="h-3 w-3 pr-1" />
        <span className="text-[11px]">{text}</span>
      </div>
    </GhostButton>
  );
}
