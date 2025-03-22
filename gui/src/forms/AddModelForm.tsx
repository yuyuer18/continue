import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button, Input, InputSubtext, StyledActionButton } from "../components";
import AddModelButtonSubtext from "../components/AddModelButtonSubtext";
import Alert from "../components/gui/Alert";
import ModelSelectionListbox from "../components/modelSelection/ModelSelectionListbox";
import { IdeMessengerContext } from "../context/IdeMessenger";
import { completionParamsInputs } from "../pages/AddNewModel/configs/completionParamsInputs";
import { DisplayInfo } from "../pages/AddNewModel/configs/models";
import {
  ProviderInfo,
  providers,
} from "../pages/AddNewModel/configs/providers";
import { setDefaultModel } from "../redux/slices/configSlice";
import { FREE_TRIAL_LIMIT_REQUESTS, hasPassedFTL } from "../util/freeTrial";

interface QuickModelSetupProps {
  onDone: () => void;
  hideFreeTrialLimitMessage?: boolean;
}

const MODEL_PROVIDERS_URL =
  "https://docs.continue.dev/customize/model-providers";
const CODESTRAL_URL = "https://console.mistral.ai/codestral";
const CONTINUE_SETUP_URL = "https://docs.continue.dev/setup/overview";

function AddModelForm({
  onDone,
  hideFreeTrialLimitMessage,
}: QuickModelSetupProps) {
  const [selectedProvider, setSelectedProvider] = useState<ProviderInfo>(
    providers["openai"]!,
  );

  const [selectedModel, setSelectedModel] = useState(
    selectedProvider.packages[0],
  );

  const formMethods = useForm();
  const dispatch = useDispatch();
  const ideMessenger = useContext(IdeMessengerContext);

  const popularProviderTitles = [
    providers["openai"]?.title || "",
    providers["anthropic"]?.title || "",
    providers["mistral"]?.title || "",
    providers["gemini"]?.title || "",
    providers["azure"]?.title || "",
    providers["ollama"]?.title || "",
  ];

  const allProviders = Object.entries(providers)
    .filter(([key]) => !["freetrial", "openai-aiohttp"].includes(key))
    .map(([, provider]) => provider)
    .filter((provider) => !!provider)
    .map((provider) => provider!); // for type checking

  const popularProviders = allProviders
    .filter((provider) => popularProviderTitles.includes(provider.title))
    .sort((a, b) => a.title.localeCompare(b.title));

  const otherProviders = allProviders
    .filter((provider) => !popularProviderTitles.includes(provider.title))
    .sort((a, b) => a.title.localeCompare(b.title));

  const selectedProviderApiKeyUrl = selectedModel.params.model.startsWith(
    "codestral",
  )
    ? CODESTRAL_URL
    : selectedProvider.apiKeyUrl;

  function isDisabled() {
    if (
      selectedProvider.downloadUrl ||
      selectedProvider.provider === "free-trial"
    ) {
      return false;
    }

    const required = selectedProvider.collectInputFor
      ?.filter((input) => input.required)
      .map((input) => {
        const value = formMethods.watch(input.key);
        return value;
      });

    return !required?.every((value) => value !== undefined && value.length > 0);
  }

  useEffect(() => {
    setSelectedModel(selectedProvider.packages[0]);
  }, [selectedProvider]);

  function onSubmit() {
    const apiKey = formMethods.watch("apiKey");
    const hasValidApiKey = apiKey !== undefined && apiKey !== "";
    const reqInputFields: Record<string, any> = {};
    for (let input of selectedProvider.collectInputFor ?? []) {
      reqInputFields[input.key] = formMethods.watch(input.key);
    }

    const model = {
      ...selectedProvider.params,
      ...selectedModel.params,
      ...reqInputFields,
      provider: selectedProvider.provider,
      title: selectedModel.title,
      ...(hasValidApiKey ? { apiKey } : {}),
    };

    ideMessenger.post("config/addModel", { model });
    ideMessenger.post("config/openProfile", {
      profileId: "local",
    });

    dispatch(setDefaultModel({ title: model.title, force: true }));

    onDone();
  }

  function onClickDownloadProvider() {
    selectedProvider.downloadUrl &&
      ideMessenger.post("openUrl", selectedProvider.downloadUrl);
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <div className="mx-auto max-w-md p-6">
          <h1 className="mb-0 text-center text-2xl">新增对话模型</h1>
          {!hideFreeTrialLimitMessage && hasPassedFTL() && (
            <p className="text-sm text-gray-400">
              You've reached the free trial limit of {FREE_TRIAL_LIMIT_REQUESTS}{" "}
              free inputs. To keep using Continue, you can either use your own
              API key, or use a local LLM. To read more about the options, see
              our{" "}
              <a
                onClick={() => ideMessenger.post("openUrl", CONTINUE_SETUP_URL)}
              >
                documentation
              </a>
              .
            </p>
          )}

          <div className="my-8 flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium">模型提供者</label>
              <ModelSelectionListbox
                selectedProvider={selectedProvider}
                setSelectedProvider={(val: DisplayInfo) => {
                  const match = [...popularProviders, ...otherProviders].find(
                    (provider) => provider.title === val.title,
                  );
                  if (match) {
                    setSelectedProvider(match);
                  }
                }}
                topOptions={popularProviders}
                otherOptions={otherProviders}
              />
              <InputSubtext className="mb-0">
                没找到你需要的模型提供者?{" "}
                <a
                  className="cursor-pointer text-inherit underline hover:text-inherit"
                  onClick={() =>
                    ideMessenger.post("openUrl", MODEL_PROVIDERS_URL)
                  }
                >
                  点击这里
                </a>{" "}
                查看更多
              </InputSubtext>
            </div>

            {selectedProvider.downloadUrl && (
              <div>
                <label className="mb-1 block text-sm font-medium">
                  安装指南
                </label>

                <StyledActionButton onClick={onClickDownloadProvider}>
                  <p className="text-sm underline">
                    {selectedProvider.downloadUrl}
                  </p>
                  <ArrowTopRightOnSquareIcon width={24} height={24} />
                </StyledActionButton>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium">模型</label>
              <ModelSelectionListbox
                selectedProvider={selectedModel}
                setSelectedProvider={(val: DisplayInfo) => {
                  const options =
                    Object.entries(providers).find(
                      ([, provider]) =>
                        provider?.title === selectedProvider.title,
                    )?.[1]?.packages ?? [];
                  const match = options.find(
                    (option) => option.title === val.title,
                  );
                  if (match) {
                    setSelectedModel(match);
                  }
                }}
                otherOptions={
                  Object.entries(providers).find(
                    ([, provider]) =>
                      provider?.title === selectedProvider.title,
                  )?.[1]?.packages
                }
              />
            </div>

            {selectedModel.params.model.startsWith("codestral") && (
              <div className="my-2">
                <Alert>
                  <p className="m-0 text-sm font-bold">Codestral API key</p>
                  <p className="m-0 mt-1">
                    请注意，codestral 需要与其他 API 密钥不同的 API 密钥
                  </p>
                </Alert>
              </div>
            )}

            {selectedProvider.apiKeyUrl && (
              <div>
                <>
                  <label className="mb-1 block text-sm font-medium">
                    API 密钥
                  </label>
                  <Input
                    id="apiKey"
                    className="w-full"
                    placeholder={`Enter your ${selectedProvider.title} API key`}
                    {...formMethods.register("apiKey")}
                  />
                  <InputSubtext className="mb-0">
                    <a
                      className="cursor-pointer text-inherit underline hover:text-inherit"
                      onClick={() => {
                        if (selectedProviderApiKeyUrl) {
                          ideMessenger.post(
                            "openUrl",
                            selectedProviderApiKeyUrl,
                          );
                        }
                      }}
                    >
                      点击这里
                    </a>{" "}
                    创建一个 {selectedProvider.title} API 密钥
                  </InputSubtext>
                </>
              </div>
            )}

            {selectedProvider.collectInputFor &&
              selectedProvider.collectInputFor
                .filter(
                  (field) =>
                    !Object.values(completionParamsInputs).some(
                      (input) => input.key === field.key,
                    ) &&
                    field.required &&
                    field.key !== "apiKey",
                )
                .map((field) => (
                  <div>
                    <>
                      <label className="mb-1 block text-sm font-medium">
                        {field.label}
                      </label>
                      <Input
                        id={field.key}
                        className="w-full"
                        defaultValue={field.defaultValue}
                        placeholder={`${field.placeholder}`}
                        {...formMethods.register(field.key)}
                      />
                    </>
                  </div>
                ))}
          </div>

          <div className="mt-4 w-full">
            <Button type="submit" className="w-full" disabled={isDisabled()}>
             测试模型
            </Button>
            <AddModelButtonSubtext />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

export default AddModelForm;
