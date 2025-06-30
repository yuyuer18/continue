import { ModelRole } from "@continuedev/config-yaml";
import { ModelDescription } from "core";
import { useAuth } from "../../../../context/Auth";
import ModelRoleSelector from "../../../../pages/config/ModelRoleSelector";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { updateSelectedModelByRole } from "../../../../redux/thunks/updateSelectedModelByRole";
import { isJetBrains } from "../../../../util";

export function ModelsSection() {
  const { selectedProfile } = useAuth();
  const dispatch = useAppDispatch();

  const config = useAppSelector((state) => state.config.config);
  const jetbrains = isJetBrains();

  function handleRoleUpdate(role: ModelRole, model: ModelDescription | null) {
    if (!model) {
      return;
    }

    void dispatch(
      updateSelectedModelByRole({
        role,
        selectedProfile,
        modelTitle: model.title,
      }),
    );
  }

  return (
    <div>
      <div className="text-[${getFontSize() - 1}px] grid grid-cols-1 gap-x-2 gap-y-1 sm:grid-cols-[auto_1fr]">
        <ModelRoleSelector
          displayName="对话"
          description="使用于对话"
          models={config.modelsByRole.chat}
          selectedModel={config.selectedModelByRole.chat}
          onSelect={(model) => handleRoleUpdate("chat", model)}
          setupURL="https://docs.continue.dev/chat/model-setup"
        />
        <ModelRoleSelector
          displayName="自动补全"
          description="用于自动补全和代码提示"
          models={config.modelsByRole.autocomplete}
          selectedModel={config.selectedModelByRole.autocomplete}
          onSelect={(model) => handleRoleUpdate("autocomplete", model)}
          setupURL="https://docs.continue.dev/autocomplete/model-setup"
        />
        {/* Jetbrains has a model selector inline */}
        {!jetbrains && (
          <ModelRoleSelector
            displayName="代码编辑"
            description="使用于行内代码编辑"
            models={config.modelsByRole.edit}
            selectedModel={config.selectedModelByRole.edit}
            onSelect={(model) => handleRoleUpdate("edit", model)}
            setupURL="https://docs.continue.dev/edit/model-setup"
          />
        )}
        <ModelRoleSelector
          displayName="应用代码"
          description="用于将生成的代码块应用于文件"
          models={config.modelsByRole.apply}
          selectedModel={config.selectedModelByRole.apply}
          onSelect={(model) => handleRoleUpdate("apply", model)}
          setupURL="https://docs.continue.dev/customize/model-roles/apply"
        />
        <ModelRoleSelector
          displayName="嵌入"
          description="用于为 @代码库和 @docs 上下文提供程序生成和查询嵌入"
          models={config.modelsByRole.embed}
          selectedModel={config.selectedModelByRole.embed}
          onSelect={(model) => handleRoleUpdate("embed", model)}
          setupURL="https://docs.continue.dev/customize/model-roles/embeddings"
        />
        <ModelRoleSelector
          displayName="重新排序"
          description=" 用于重新排序来自 @代码库和 @docs 上下文提供程序的结果"
          models={config.modelsByRole.rerank}
          selectedModel={config.selectedModelByRole.rerank}
          onSelect={(model) => handleRoleUpdate("rerank", model)}
          setupURL="https://docs.continue.dev/customize/model-roles/reranking"
        />
      </div>
    </div>
  );
}
