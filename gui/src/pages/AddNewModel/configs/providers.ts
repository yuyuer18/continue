import { HTMLInputTypeAttribute } from "react";
import { ModelProviderTags } from "../../../components/modelSelection/utils";
import { completionParamsInputs } from "./completionParamsInputs";
import type { ModelPackage } from "./models";
import { models } from "./models";

export interface InputDescriptor {
  inputType: HTMLInputTypeAttribute;
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string | number;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  required?: boolean;
  description?: string;
  [key: string]: any;
}

export interface ProviderInfo {
  title: string;
  icon?: string;
  provider: string;
  description: string;
  longDescription?: string;
  tags?: ModelProviderTags[];
  packages: ModelPackage[];
  params?: any;
  collectInputFor?: InputDescriptor[];
  refPage?: string;
  apiKeyUrl?: string;
  downloadUrl?: string;
  apiBase?: string;
}

const completionParamsInputsConfigs = Object.values(completionParamsInputs);

const openSourceModels = Object.values(models).filter(
  ({ isOpenSource }) => isOpenSource,
);

export const apiBaseInput: InputDescriptor = {
  inputType: "text",
  key: "apiBase",
  label: "API Base",
  placeholder: "e.g. http://localhost:8080",
  required: false,
};

export const providers: Partial<Record<string, ProviderInfo>> = {
  openai: {
    title: "OpenAI",
    provider: "openai",
    description: "Use gpt-4, gpt-3.5-turbo, or any other OpenAI model",
    longDescription:
      "Use gpt-4, gpt-3.5-turbo, or any other OpenAI model. See [here](https://openai.com/product#made-for-developers) to obtain an API key.",
    icon: "openai.png",
    tags: [ModelProviderTags.RequiresApiKey],
    packages: [
      models.gpt4o,
      models.gpt4omini,
      models.gpt4turbo,
      models.gpt35turbo,
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "OpenAI",
        },
      },
    ],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your OpenAI API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    apiKeyUrl: "https://platform.openai.com/account/api-keys",
  },
  anthropic: {
    title: "Anthropic",
    provider: "anthropic",
    refPage: "anthropicllm",
    description:
      "Anthropic builds state-of-the-art models with large context length and high recall",
    icon: "anthropic.png",
    tags: [ModelProviderTags.RequiresApiKey],
    longDescription:
      "To get started with Anthropic models, you first need to sign up for the open beta [here](https://claude.ai/login) to obtain an API key.",
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Anthropic API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
      {
        ...completionParamsInputs.contextLength,
        defaultValue: 100000,
      },
    ],
    packages: [
      models.claude35Sonnet,
      models.claude3Opus,
      models.claude3Sonnet,
      models.claude35Haiku,
    ],
    apiKeyUrl: "https://console.anthropic.com/account/keys",
  },
  moonshot: {
    title: "Moonshot",
    provider: "moonshot",
    description: "Use the Moonshot API for LLMs",
    longDescription: `[Visit our documentation](https://docs.continue.dev/reference/Model%20Providers/moonshot) for information on obtaining an API key.`,
    icon: "moonshot.png",
    tags: [ModelProviderTags.RequiresApiKey],
    refPage: "moonshot",
    apiKeyUrl: "https://docs.moonshot.cn/docs/getting-started",
    packages: [models.moonshotChat],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Moonshot API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
  },
  "function-network": {
    title: "Function Network",
    provider: "function-network",
    refPage: "function-network",
    description:
      "Run open-source models on Function Network. Private, Affordable User-Owned AI",
    icon: "function-network.png",
    longDescription: `Function Network is a private, affordable user-owned AI platform that allows you to run open-source models. Experience bleeding-edge Generative AI models with limitless scalability, all powered by our distributed inference network.`,
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Function Network API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [models.llama31Chat, models.deepseek],
    apiKeyUrl: "https://function.network/join-waitlist",
  },
  ovhcloud: {
    title: "OVHcloud",
    provider: "ovhcloud",
    refPage: "ovhcloud",
    description:
      "OVHcloud AI Endpoints is a serverless inference API that provides access to a curated selection of models (e.g., Llama, Mistral, Qwen, Deepseek). It is designed with security and data privacy in mind and is compliant with GDPR.",
    longDescription: `To get started, create an API key on the OVHcloud [AI Endpoints website](https://endpoints.ai.cloud.ovh.net/). For more information, including pricing, visit the OVHcloud [AI Endpoints product page](https://www.ovhcloud.com/en/public-cloud/ai-endpoints/).`,
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API key",
        placeholder: "Enter your AI Endpoints API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    icon: "ovhcloud.png",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    packages: [
      models.llama318bChat,
      models.llama3170bChat,
      models.llama3370bChat,
      models.codestralMamba,
      models.mistralOs,
      models.mistralNemo,
      models.Qwen25Coder32b,
      models.deepseekR1DistillLlama70B,
    ],
    apiKeyUrl: "https://endpoints.ai.cloud.ovh.net/",
  },
  scaleway: {
    title: "Scaleway",
    provider: "scaleway",
    refPage: "scaleway",
    description:
      "Use the Scaleway Generative APIs to instantly access leading open models",
    longDescription: `Hosted in European data centers, ideal for developers requiring low latency, full data privacy, and compliance with EU AI Act. You can generate your API key in [Scaleway's console](https://console.scaleway.com/generative-api/models). Get started:\n1. Create an API key [here](https://console.scaleway.com/iam/api-keys/)\n2. Paste below\n3. Select a model preset`,
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API key",
        placeholder: "Enter your Scaleway API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    icon: "scaleway.png",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    packages: [
      models.llama318bChat,
      models.llama3170bChat,
      models.mistralNemo,
      models.Qwen25Coder32b,
    ],
    apiKeyUrl: "https://console.scaleway.com/iam/api-keys",
  },
  azure: {
    title: "Azure OpenAI",
    provider: "azure",
    description:
      "Azure OpenAI Service offers industry-leading coding and language AI models that you can fine-tune to your specific needs for a variety of use cases.",
    longDescription: `[Visit our documentation](https://docs.continue.dev/reference/Model%20Providers/azure) for information on obtaining an API key.

Select the \`GPT-4o\` model below to complete your provider configuration, but note that this will not affect the specific model you need to select when creating your Azure deployment.`,
    icon: "azure.png",
    tags: [ModelProviderTags.RequiresApiKey],
    refPage: "azure",
    apiKeyUrl:
      "https://azure.microsoft.com/en-us/products/ai-services/openai-service",
    packages: [models.gpt4o],
    params: {
      apiKey: "",
      deployment: "",
      apiBase: "",
      apiVersion: "",
      apiType: "azure",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Azure OpenAI API key",
        required: true,
      },
      {
        inputType: "text",
        key: "deployment",
        label: "Deployment",
        placeholder: "Enter the deployment name",
        required: true,
      },
      { ...apiBaseInput, required: true },
      {
        inputType: "text",
        key: "apiVersion",
        label: "API Version",
        placeholder: "Enter the API version",
        required: false,
        defaultValue: "2023-07-01-preview",
      },
      ...completionParamsInputsConfigs,
    ],
  },
  mistral: {
    title: "Mistral",
    provider: "mistral",
    description:
      "The Mistral API provides seamless access to their models, including Codestral, Mistral 8x22B, Mistral Large, and more.",
    icon: "mistral.png",
    longDescription: `To get access to the Mistral API, obtain your API key from [here](https://console.mistral.ai/codestral) for Codestral or the [Mistral platform](https://docs.mistral.ai/) for all other models.`,
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Mistral API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.codestral,
      models.codestralMamba,
      models.mistralLarge,
      models.mistralSmall,
      models.mistral8x22b,
      models.mistral8x7b,
      models.mistral7b,
    ],
    apiKeyUrl: "https://console.mistral.ai/codestral",
  },
  ollama: {
    title: "Ollama",
    provider: "ollama",
    apiBase: "http://localhost:11434/v1/",
    description:
      "在 Mac、Linux 或 Windows 上开始使用本地模型的最快方法",
    longDescription:
      'ollama 是一个开源的 LLM 推理框架，提供高性能的解决方案。要开始使用 ollama，请访问 [ollama.ai](https://ollama.ai/) 以获取更多信息.',
    icon: "ollama2.png",
    tags: [ModelProviderTags.Local, ModelProviderTags.OpenSource],
    packages: [
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "Ollama",
        },
      },
      ...openSourceModels,
    ],
    collectInputFor: [
      ...completionParamsInputsConfigs,
      { ...apiBaseInput, defaultValue: "http://ollama-4090.amarsoft.com" },
    ],
  },
  vllm: {
    title: "vllm-API",
    provider: "vllm",
    apiBase: "http://vllm-l20.amarsoft.com/v1/",
    description:
      "简单、快速、廉价的大语言模型的推理提供高性能的解决方案。",
    longDescription:
      'vllm 是一个开源的 LLM 推理框架，提供高性能的解决方案。要开始使用 vllm，请访问 [vllm.ai](https://vllm.ai/) 以获取更多信息。',
    icon: "vllm-logo.png",
    tags: [ModelProviderTags.Local, ModelProviderTags.OpenSource],
    packages: [
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "VLLM",
        },
      },
      ...openSourceModels,
    ],
    collectInputFor: [
      ...completionParamsInputsConfigs,
      { ...apiBaseInput, defaultValue: "http://localhost:11434" },
    ],
  },
  cohere: {
    title: "Cohere",
    provider: "cohere",
    refPage: "cohere",
    description:
      "Optimized for enterprise generative AI, search and discovery, and advanced retrieval.",
    icon: "cohere.png",
    tags: [ModelProviderTags.RequiresApiKey],
    longDescription:
      "To use Cohere, visit the [Cohere dashboard](https://dashboard.cohere.com/api-keys) to create an API key.",
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Cohere API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.commandA032025,
      models.commandR7BArabic022025,
      models.commandR7B122024,
      models.commandRPlus082024,
      models.commandR082024,
      models.commandRPlus042024,
      models.commandR032024,
      models.c4aiAyaVision32B,
      models.c4aiAyaVision8B,
      models.c4aiAyaExpanse32B,
      models.c4aiAyaExpanse8B,
    ],
    apiKeyUrl: "https://docs.cohere.com/v2/docs/rate-limits",
  },
  groq: {
    title: "Groq",
    provider: "groq",
    icon: "groq.png",
    description:
      "Groq is the fastest LLM provider by a wide margin, using 'LPUs' to serve open-source models at blazing speed.",
    longDescription:
      "To get started with Groq, obtain an API key from their website [here](https://wow.groq.com/).",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Groq API key",
        required: true,
      },
    ],
    packages: [
      models.llama31405bChat,
      models.llama3170bChat,
      models.llama318bChat,
      { ...models.mixtralTrial, title: "Mixtral" },
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "Groq",
        },
      },
    ],
    apiKeyUrl: "https://console.groq.com/keys",
  },
  deepseek: {
    title: "DeepSeek",
    provider: "deepseek",
    icon: "deepseek.png",
    description:
      "DeepSeek provides cheap inference of its DeepSeek Coder v2 and other impressive open-source models.",
    longDescription:
      "To get started with DeepSeek, obtain an API key from their website [here](https://platform.deepseek.com/api_keys).",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your DeepSeek API key",
        required: true,
      },
    ],
    packages: [
      models.deepseekCoderApi,
      models.deepseekChatApi,
      models.deepseekReasonerApi,
    ],
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
  },
  together: {
    title: "TogetherAI",
    provider: "together",
    refPage: "together",
    description:
      "Use the TogetherAI API for extremely fast streaming of open-source models",
    icon: "together.png",
    longDescription: `Together is a hosted service that provides extremely fast streaming of open-source language models. To get started with Together:\n1. Obtain an API key from [here](https://together.ai)\n2. Paste below\n3. Select a model preset`,
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your TogetherAI API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.llama31Chat,
      models.codeLlamaInstruct,
      models.mistralOs,
    ].map((p) => {
      p.params.contextLength = 4096;
      return p;
    }),
    apiKeyUrl: "https://api.together.xyz/settings/api-keys",
  },
  ncompass: {
    title: "nCompass",
    provider: "ncompass",
    refPage: "ncompass",
    description:
      "Use the nCompass API for extremely fast streaming of open-source models",
    icon: "ncompass.png",
    longDescription: `nCompass is an extremely fast inference engine for open-source language models. To get started, obtain an API key from [their console](https://app.ncompass.tech/api-settings).`,
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your nCompass API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.llama318bChat,
      models.llama3370bChat,
      models.Qwen25Coder32b,
    ].map((p) => {
      p.params.contextLength = 4096;
      return p;
    }),
    apiKeyUrl: "https://app.ncompass.tech/api-settings",
  },
  novita: {
    title: "NovitaAI",
    provider: "novita",
    refPage: "novita",
    description:
      "Use Novita AI API for extremely fast streaming of open-source models",
    icon: "novita.png",
    longDescription: `[Novita AI](https://novita.ai?utm_source=github_continuedev&utm_medium=github_readme&utm_campaign=github_link) offers an affordable, reliable, and simple inference platform with scalable [LLM APIs](https://novita.ai/docs/model-api/reference/introduction.html), empowering developers to build AI applications. To get started with Novita AI:\n1. Obtain an API key from [here](https://novita.ai/settings/key-management?utm_source=github_continuedev&utm_medium=github_readme&utm_campaign=github_link)\n2. Paste below\n3. Select a model preset`,
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Novita AI API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.llama318BChat,
      models.mistralChat,
      models.deepseekR1Chat,
      models.deepseekV3Chat,
    ].map((p) => {
      p.params.contextLength = 4096;
      return p;
    }),
    apiKeyUrl:
      "https://novita.ai/settings/key-management?utm_source=github_continuedev&utm_medium=github_readme&utm_campaign=github_link",
  },
  gemini: {
    title: "Google Gemini API",
    provider: "gemini",
    refPage: "geminiapi",
    description:
      "Try out Google's state-of-the-art Gemini model from their API.",
    longDescription: `To get started with Google Gemini API, obtain your API key from [here](https://ai.google.dev/tutorials/workspace_auth_quickstart) and paste it below.`,
    icon: "gemini.png",
    tags: [ModelProviderTags.RequiresApiKey],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Gemini API key",
        required: true,
      },
    ],
    packages: [
      models.gemini20Flash,
      models.gemini20FlashLite,
      models.gemini20FlashImageGeneration,
      models.gemini25ProExp,
      models.gemini15Pro,
      models.geminiPro,
      models.gemini15Flash,
    ],
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
  },
  xAI: {
    title: "xAI",
    provider: "xAI",
    icon: "xAI.png",
    description:
      "xAI is a company working on building artificial intelligence to accelerate human scientific discovery",
    longDescription:
      "To get started with xAI, obtain an API key from their [console](https://console.x.ai/).",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your xAI API key",
        required: true,
      },
    ],
    packages: [models.grokBeta],
    apiKeyUrl: "https://console.x.ai/",
  },
  lmstudio: {
    title: "LM Studio",
    provider: "lmstudio",
    description:
      "One of the fastest ways to get started with local models on Mac or Windows",
    longDescription:
      "LMStudio provides a professional and well-designed GUI for exploring, configuring, and serving LLMs. It is available on both Mac and Windows. To get started:\n1. Download from [lmstudio.ai](https://lmstudio.ai/) and open the application\n2. Search for and download the desired model from the home screen of LMStudio.\n3. In the left-bar, click the '<->' icon to open the Local Inference Server and press 'Start Server'.\n4. Once your model is loaded and the server has started, you can begin using Continue.",
    icon: "lmstudio.png",
    tags: [ModelProviderTags.Local, ModelProviderTags.OpenSource],
    params: {
      apiBase: "http://localhost:1234/v1/",
    },
    packages: [
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "LM Studio",
        },
      },
      ...openSourceModels,
    ],
    collectInputFor: [...completionParamsInputsConfigs],
    downloadUrl: "https://lmstudio.ai/",
  },
  llamafile: {
    title: "llamafile",
    provider: "llamafile",
    icon: "llamafile.png",
    description:
      "llamafiles are a self-contained binary to run an open-source LLM",
    longDescription: `To get started with llamafiles, find and download a binary on their [GitHub repo](https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#quickstart). Then run it with the following command:\n\n\`\`\`shell\nchmod +x ./llamafile\n./llamafile\n\`\`\``,
    tags: [ModelProviderTags.Local, ModelProviderTags.OpenSource],
    packages: openSourceModels,
    collectInputFor: [...completionParamsInputsConfigs],
    downloadUrl:
      "https://github.com/Mozilla-Ocho/llamafile?tab=readme-ov-file#quickstart",
  },
  replicate: {
    title: "Replicate",
    provider: "replicate",
    refPage: "replicatellm",
    description: "Use the Replicate API to run open-source models",
    longDescription: `Replicate is a hosted service that makes it easy to run ML models. To get started with Replicate:\n1. Obtain an API key from [here](https://replicate.com)\n2. Paste below\n3. Select a model preset`,
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Replicate API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    icon: "replicate.png",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    packages: [
      models.llama3Chat,
      models.codeLlamaInstruct,
      models.wizardCoder,
      models.mistralOs,
    ],
    apiKeyUrl: "https://replicate.com/account/api-tokens",
  },
  "llama.cpp": {
    title: "llama.cpp",
    provider: "llama.cpp",
    refPage: "llamacpp",
    description: "If you are running the llama.cpp server from source",
    longDescription: `llama.cpp comes with a [built-in server](https://github.com/ggerganov/llama.cpp/tree/master/examples/server#llamacppexampleserver) that can be run from source. To do this:

1. Clone the repository with \`git clone https://github.com/ggerganov/llama.cpp\`.
2. \`cd llama.cpp\`
3. Run \`make\` to build the server.
4. Download the model you'd like to use and place it in the \`llama.cpp/models\` directory (the best place to find models is [The Bloke on HuggingFace](https://huggingface.co/TheBloke))
5. Run the llama.cpp server with the command below (replacing with the model you downloaded):

\`\`\`shell
.\\server.exe -c 4096 --host 0.0.0.0 -t 16 --mlock -m models/codellama-7b-instruct.Q8_0.gguf
\`\`\`

After it's up and running, you can start using Continue.`,
    icon: "llamacpp.png",
    tags: [ModelProviderTags.Local, ModelProviderTags.OpenSource],
    packages: openSourceModels,
    collectInputFor: [...completionParamsInputsConfigs],
    downloadUrl: "https://github.com/ggerganov/llama.cpp",
  },
  "openai-aiohttp": {
    title: "Other OpenAI-compatible API",
    provider: "openai",
    description:
      "If you are using any other OpenAI-compatible API, for example text-gen-webui, FastChat, LocalAI, or llama-cpp-python, you can simply enter your server URL",
    longDescription: `If you are using any other OpenAI-compatible API, you can simply enter your server URL. If you still need to set up your model server, you can follow a guide below:

- [text-gen-webui](https://github.com/oobabooga/text-generation-webui/tree/main/extensions/openai#setup--installation)
- [LocalAI](https://localai.io/basics/getting_started/)
- [llama-cpp-python](https://github.com/continuedev/ggml-server-example)
- [FastChat](https://github.com/lm-sys/FastChat/blob/main/docs/openai_api.md)`,
    params: {
      apiBase: "",
    },
    collectInputFor: [
      {
        ...apiBaseInput,
        defaultValue: "http://localhost:8000/v1/",
      },
      ...completionParamsInputsConfigs,
    ],
    icon: "openai.png",
    tags: [ModelProviderTags.Local, ModelProviderTags.OpenSource],
    packages: [
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "OpenAI",
        },
      },
      ...openSourceModels,
    ],
  },
  watsonx: {
    title: "IBM watsonx",
    provider: "watsonx",
    refPage: "watsonX",
    description:
      "Explore foundation models from IBM and other third-parties depending on your use case.",
    longDescription: `**watsonx**, developed by IBM, offers a variety of pre-trained AI foundation models that can be used for natural language processing (NLP), computer vision, and speech recognition tasks.

To get started, [register](https://dataplatform.cloud.ibm.com/registration/stepone?context=wx) on watsonx SaaS, create your first project and setup an [API key](https://www.ibm.com/docs/en/mas-cd/continuous-delivery?topic=cli-creating-your-cloud-api-key).`,
    collectInputFor: [
      {
        inputType: "text",
        key: "apiBase",
        label: "watsonx URL",
        placeholder: "e.g. http://us-south.dataplatform.cloud.ibm.com",
        required: true,
      },
      {
        inputType: "text",
        key: "projectId",
        label: "Project ID",
        placeholder: "Enter your project ID",
        required: true,
      },
      {
        inputType: "text",
        key: "apiKey",
        label: "API key",
        placeholder: "Enter your API key (SaaS) or ZenApiKey (Software)",
        required: true,
      },
      {
        inputType: "text",
        key: "apiVersion",
        label: "API version",
        placeholder: "Enter the API Version",
        defaultValue: "2024-03-14",
        required: true,
      },
      {
        inputType: "text",
        key: "deploymentId",
        label: "Deployment ID",
        placeholder: "Enter model deployment ID",
        required: false,
      },
      ...completionParamsInputsConfigs,
    ],
    apiKeyUrl:
      "https://dataplatform.cloud.ibm.com/registration/stepone?context=wx",
    icon: "WatsonX.png",
    tags: [ModelProviderTags.RequiresApiKey],
    packages: [
      models.granite3Instruct8b,
      models.granite3Instruct2b,
      models.graniteCode3b,
      models.graniteCode8b,
      models.graniteCode20b,
      models.graniteCode34b,
      models.graniteChat,
      models.MistralLarge,
      models.MetaLlama3,
    ],
  },
  sambanova: {
    title: "SambaNova",
    provider: "sambanova",
    refPage: "sambanova",
    description: "Use SambaNova Cloud for fast inference performance",
    icon: "sambanova.png",
    longDescription: `The SambaNova Cloud is a cloud platform for running large open source AI models with the world record performance and zero data retention. You can sign up [here](http://cloud.sambanova.ai?utm_source=continue&utm_medium=external&utm_campaign=cloud_signup)`,
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your SambaNova Cloud API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.llama4Scout,
      models.llama4Maverick,
      models.llama3370BInstruct,
      models.llama318BInstruct,
      models.llama31405BInstruct,
      models.llama321BInstruct,
      models.llama323BInstruct,
      models.qwq32B,
      models.deepseekR1DistillLlama70B,
      models.deepseekR1,
      models.deepseekV3,
    ],
    apiKeyUrl: "https://cloud.sambanova.ai/apis",
  },
  cerebras: {
    title: "Cerebras",
    provider: "cerebras",
    icon: "cerebras.png",
    description:
      "Cerebras Inference is a custom silicon for fast inference of LLM models.",
    longDescription: "Get your API key [here](https://cloud.cerebras.ai/).",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Cerebras API key",
        required: true,
      },
    ],
    packages: [
      models.llama3170bChat,
      models.llama318bChat,
      {
        ...models.AUTODETECT,
        params: {
          ...models.AUTODETECT.params,
          title: "Cerebras",
        },
      },
    ],
    apiKeyUrl: "https://cloud.cerebras.ai/",
  },
  vertexai: {
    title: "VertexAI",
    provider: "vertexai",
    description: "Use supported Vertex AI models",
    longDescription:
      "Use the supported Vertex AI models - see [here](https://cloud.google.com/docs/authentication/provide-credentials-adc) to authenticate",
    icon: "vertexai.png",
    packages: [
      models.VertexGemini15Pro,
      models.VertexGemini15Flash,
      models.mistralLarge,
    ],
    collectInputFor: [
      {
        inputType: "project",
        key: "projectId",
        label: "Project Id",
        placeholder: "Enter your Vertex AI project Id",
        required: true,
      },
      {
        inputType: "region",
        key: "region",
        label: "Region",
        placeholder: "Enter your Vertex AI region",
        required: true,
      },

      ...completionParamsInputsConfigs,
    ],
  },

  askSage: {
    title: "Ask Sage",
    provider: "askSage",
    icon: "ask-sage.png",
    description:
      "The Ask Sage API provides seamless access to LLMs including OpenAI, Anthropic, Meta, Mistral, and more.",
    longDescription: `To get access to the Ask Sage API, obtain your API key from the [Ask Sage platform](https://chat.asksage.ai/) for all other models.`,
    tags: [ModelProviderTags.RequiresApiKey],
    params: {
      apiKey: "",
      apiBase: "https://api.asksage.ai/server/", // Default base URL
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Ask Sage API key",
        required: true,
      },
      {
        inputType: "text",
        key: "apiBase",
        label: "API Base URL",
        placeholder: "Enter the API Base URL",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    packages: [
      models.asksagegpt4ogov,
      models.asksagegpt4ominigov,
      models.asksagegpt4gov,
      models.asksagegpt35gov,
      models.gpt4o,
      models.gpt4omini,
      models.asksagegpt4,
      models.asksagegpt432,
      models.asksagegpto1,
      models.asksagegpto1mini,
      models.gpt35turbo,
      models.asksageclaude35gov,
      models.claude35Sonnet,
      models.claude3Opus,
      models.claude3Sonnet,
      models.grokBeta,
      models.asksagegroqllama33,
      models.asksagegroq70b,
      models.mistralLarge,
      models.llama370bChat,
      models.gemini15Pro,
    ],
    apiKeyUrl: "https://chat.asksage.ai/",
  },
  nebius: {
    title: "Nebius AI Studio",
    provider: "nebius",
    refPage: "nebius",
    description: "Use the Nebius API to run open-source models",
    longDescription: `Nebius AI Studio is a cheap hosted service with $100 trial. To get started with Nebius AI Studio:\n1. Obtain an API key from [here](https://studio.nebius.ai)\n2. Paste below\n3. Select a model preset`,
    params: {
      apiKey: "",
    },
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Nebius AI Studio API key",
        required: true,
      },
      ...completionParamsInputsConfigs,
    ],
    icon: "nebius.png",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    packages: [
      models.deepseekR1Chat,
      models.deepseekV3Chat,
      models.QwenQwQ_32b_preview,
      models.Qwen25Coder_32b,
      models.llama318bChat,
      models.llama3170bChat,
      models.llama31405bChat,
      models.llama3170bNemotron,
      models.mistral8x7b,
      models.mistral8x22b,
      models.mistralNemo,
      models.phi3mini,
      models.phi3medium,
      models.gemma2_2b,
      models.gemma2_9b,
      models.Qwen2Coder,
      models.deepseekCoder2Lite,
      models.olmo7b,
    ],
    apiKeyUrl: "https://studio.nebius.ai/settings/api-keys",
  },
  siliconflow: {
    title: "SiliconFlow",
    provider: "siliconflow",
    icon: "siliconflow.png",
    description: "SiliconFlow provides cheap open-source models.",
    longDescription:
      "To get started with SiliconFlow, obtain an API key from their website [here](https://cloud.siliconflow.cn/account/ak).",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your SiliconFlow API key",
        required: true,
      },
    ],
    packages: [
      models.QwenQwQ_32b_preview,
      models.Qwen25Coder_32b,
      models.Hunyuan_a52b,
      models.Llama31Nemotron_70b,
    ],
    apiKeyUrl: "https://cloud.siliconflow.cn/account/ak",
  },
  venice: {
    title: "Venice",
    provider: "venice",
    icon: "venice.png",
    description: "Venice.",
    tags: [ModelProviderTags.RequiresApiKey, ModelProviderTags.OpenSource],
    collectInputFor: [
      {
        inputType: "text",
        key: "apiKey",
        label: "API Key",
        placeholder: "Enter your Venice API key",
        required: true,
      },
    ],
    packages: [{ ...models.AUTODETECT }],
    apiKeyUrl: "https://venice.ai/chat",
  },
};
