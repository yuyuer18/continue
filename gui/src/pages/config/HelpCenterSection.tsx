import {
  ArrowTopRightOnSquareIcon,
  DocumentArrowUpIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useAppDispatch } from "../../redux/hooks";
import { setOnboardingCard } from "../../redux/slices/uiSlice";
import { saveCurrentSession } from "../../redux/thunks/session";
import MoreHelpRow from "./MoreHelpRow";

export function HelpCenterSection() {
  const ideMessenger = useContext(IdeMessengerContext);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <div className="py-5">
      <h3 className="mb-4 mt-0 text-xl">帮助中心</h3>
      <div className="-mx-4 flex flex-col">
        <MoreHelpRow
          title="Continue Hub"
          description="Visit hub.continue.dev to explore custom assistants and blocks"
          Icon={ArrowTopRightOnSquareIcon}
          onClick={() =>
            ideMessenger.post("openUrl", "https://hub.continue.dev/")
          }
        />

        <MoreHelpRow
          title="Documentation"
          description="Learn how to configure and use Continue"
          Icon={ArrowTopRightOnSquareIcon}
          onClick={() =>
            ideMessenger.post("openUrl", "https://home.amarsoft.com/")
          }
        />

        <MoreHelpRow
          title="有问题?"
          description="告诉我们您的问题或建议"
          Icon={ArrowTopRightOnSquareIcon}
          onClick={() =>
            ideMessenger.post(
              "openUrl",
              "https://github.com/continuedev/continue/issues/new/choose",
            )
          }
        />

        <MoreHelpRow
          title="加入我们!"
          description="Join us on Discord to stay up-to-date on the latest developments"
          Icon={ArrowTopRightOnSquareIcon}
          onClick={() =>
            ideMessenger.post("openUrl", "https://home.amarsoft.com/")
          }
        />

        <MoreHelpRow
          title="Token使用统计"
          description="显示当前模型的token使用情况"
          Icon={TableCellsIcon}
          onClick={() => navigate("/stats")}
        />

        <MoreHelpRow
          title="快速开始"
          description="重新打开快速开始和教程文件"
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
  );
}
