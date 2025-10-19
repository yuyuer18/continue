import { IndexingProgressUpdate } from "core";
import { usePostHog } from "posthog-js/react";
import { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import ConfirmationDialog from "../../../../components/dialogs/ConfirmationDialog";
import { IdeMessengerContext } from "../../../../context/IdeMessenger";
import { useWebviewListener } from "../../../../hooks/useWebviewListener";
import {
  setDialogMessage,
  setShowDialog,
} from "../../../../redux/slices/uiSlice";
import { isJetBrains } from "../../../../util";
import IndexingProgressBar from "./IndexingProgressBar";
import IndexingProgressErrorText from "./IndexingProgressErrorText";
import IndexingProgressIndicator from "./IndexingProgressIndicator";
import IndexingProgressSubtext from "./IndexingProgressSubtext";
import IndexingProgressTitleText from "./IndexingProgressTitleText";

export function getProgressPercentage(
  progress: IndexingProgressUpdate["progress"],
) {
  return Math.min(100, Math.max(0, progress * 100));
}

function IndexingProgress() {
  const ideMessenger = useContext(IdeMessengerContext);
  const posthog = usePostHog();
  const dispatch = useDispatch();
  const [paused, setPaused] = useState<boolean | undefined>(undefined);
  const [update, setUpdate] = useState<IndexingProgressUpdate>({
    desc: "加载索引配置",
    progress: 0.0,
    status: "loading",
  });

  // If sidebar is opened after extension initializes, retrieve saved states.
  let initialized = false;

  useWebviewListener("indexProgress", async (data) => {
    setUpdate(data);
  });

  useEffect(() => {
    if (!initialized) {
      // Triggers retrieval for possible non-default states set prior to IndexingProgressBar initialization
      ideMessenger.post("index/indexingProgressBarInitialized", undefined);
      initialized = true;
    }
  }, []);

  useEffect(() => {
    if (paused === undefined) return;
    ideMessenger.post("index/setPaused", paused);
  }, [paused]);

  function onClickRetry() {
    // For now, we don't show in JetBrains since the re-index command
    // is not yet implemented
    if (update.shouldClearIndexes && !isJetBrains()) {
      dispatch(setShowDialog(true));
      dispatch(
        setDialogMessage(
          <ConfirmationDialog
            title="重建代码库索引"
            confirmText="Rebuild"
            text={
              "您的索引似乎已损坏。我们建议清理并重建它, " +
              "对于大型代码库来说，这可能需要比较长的时间.\n\n" +
              "按 'Shift + Command + P' 键，无需清除数据即可更快地重建, " +
              "命令面板，然后输入 'Continue: Force Codebase Re-Indexing' 再次索引"
            }
            onConfirm={() => {
              posthog.capture("rebuild_index_clicked");
              ideMessenger.post("index/forceReIndex", {
                shouldClearIndexes: true,
              });
            }}
          />,
        ),
      );
    } else {
      ideMessenger.post("index/forceReIndex", undefined);
    }
  }

  function onClick() {
    switch (update.status) {
      case "failed":
        onClickRetry();
        break;
      case "indexing":
      case "loading":
      case "paused":
        if (update.progress < 1 && update.progress >= 0) {
          setPaused((prev) => !prev);
        } else {
          ideMessenger.post("index/forceReIndex", undefined);
        }
        break;
      case "disabled":
        ideMessenger.post("config/openProfile", {
          profileId: undefined,
        });
        break;
      case "done":
        ideMessenger.post("index/forceReIndex", undefined);
      default:
        break;
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-0 flex justify-between text-sm">
        <IndexingProgressTitleText update={update} />
        {!["loading", "waiting"].includes(update.status) && (
          <IndexingProgressIndicator update={update} />
        )}
      </div>

      <IndexingProgressBar update={update} />

      <IndexingProgressSubtext update={update} onClick={onClick} />

      {(update.status === "failed" ||
        (update.warnings && update.warnings.length > 0)) && (
        <div className="mt-4">
          <IndexingProgressErrorText update={update} />
        </div>
      )}
    </div>
  );
}

export default IndexingProgress;
