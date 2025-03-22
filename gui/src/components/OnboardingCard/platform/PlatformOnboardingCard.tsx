import { useState } from "react";
import { useAppSelector } from "../../../redux/hooks";
import { getLocalStorage, setLocalStorage } from "../../../util/localStorage";
import Alert from "../../gui/Alert";
import { ReusableCard } from "../../ReusableCard";
import { TabTitle } from "../components/OnboardingCardTabs";
import { useOnboardingCard } from "../hooks";
import OnboardingLocalTab from "../tabs/OnboardingLocalTab";
import MainTab from "./tabs/main";

export interface OnboardingCardState {
  show?: boolean;
  activeTab?: TabTitle;
}

interface OnboardingCardProps {
  isDialog: boolean;
}

export function PlatformOnboardingCard({ isDialog }: OnboardingCardProps) {
  const onboardingCard = useOnboardingCard();
  const config = useAppSelector((store) => store.config.config);
  const [currentTab, setCurrentTab] = useState<"main" | "local">("main");

  if (getLocalStorage("onboardingStatus") === undefined) {
    setLocalStorage("onboardingStatus", "Started");
  }

  return (
    <ReusableCard
      showCloseButton={!isDialog && !!config.models.length}
      onClose={() => onboardingCard.close()}
    >
      <div className="flex h-full w-full items-center justify-center">
        {currentTab === "main" ? (
          <MainTab
            onRemainLocal={() => setCurrentTab("local")}
            isDialog={isDialog}
          />
        ) : (
          <div className="mt-4 flex flex-col">
              <Alert type="info">
              通过修改 "Local"，KodeMate AI 将使用本地配置文件进行配置。您可以在
              <code>config.yaml</code> 文件配置. 如果您只是想使用 Ollama
              并希望通过 Kodemate AI 进行配置, 点击{" "}
              <a href="#" onClick={() => setCurrentTab("main")}>
                这里
              </a>
            </Alert>
            <OnboardingLocalTab isDialog={isDialog} />
          </div>
        )}
      </div>
    </ReusableCard>
  );
}
