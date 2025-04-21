import { useState } from "react";
import { useAuth } from "../../../context/Auth";
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
  const auth = useAuth();
  const [currentTab, setCurrentTab] = useState<"main" | "local">("main");

  if (getLocalStorage("onboardingStatus") === undefined) {
    setLocalStorage("onboardingStatus", "Started");
  }

  function onGetStarted() {
    auth.login(true).then((success) => {
      if (success) {
        onboardingCard.close(isDialog);
      }
    });
  }

  return (
    <ReusableCard
      showCloseButton={!isDialog && !!config.modelsByRole.chat.length}
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
              通过选择此选项，KodemateAI 将由本地的 config.yaml
              文件进行配置。如果只是想使用 Ollama 并且仍然希望通过 Kodemate AI
              管理你的配置，请点击。{" "}
              <a href="#" onClick={onGetStarted}>
                此处
              </a>
            </Alert>
            <OnboardingLocalTab isDialog={isDialog} />
          </div>
        )}
      </div>
    </ReusableCard>
  );
}
