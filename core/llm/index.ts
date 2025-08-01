import { ModelRole } from "@continuedev/config-yaml";
import { fetchwithRequestOptions } from "@continuedev/fetch";
import { findLlmInfo } from "@continuedev/llm-info";
import {
  BaseLlmApi,
  ChatCompletionCreateParams,
  constructLlmApi,
} from "@continuedev/openai-adapters";
import Handlebars from "handlebars";

import { DevDataSqliteDb } from "../data/devdataSqlite.js";
import { DataLogger } from "../data/log.js";
import {
  CacheBehavior,
  ChatMessage,
  Chunk,
  CompletionOptions,
  ILLM,
  ILLMInteractionLog,
  ILLMLogger,
  LLMFullCompletionOptions,
  LLMOptions,
  ModelCapability,
  ModelInstaller,
  PromptLog,
  PromptTemplate,
  RequestOptions,
  TabAutocompleteOptions,
  TemplateType,
} from "../index.js";
import mergeJson from "../util/merge.js";
import { renderChatMessage } from "../util/messageContent.js";
import { isOllamaInstalled } from "../util/ollamaHelper.js";
import { Telemetry } from "../util/posthog.js";
import { withExponentialBackoff } from "../util/withExponentialBackoff.js";

import {
  autodetectPromptTemplates,
  autodetectTemplateFunction,
  autodetectTemplateType,
  modelSupportsImages,
} from "./autodetect.js";
import {
  DEFAULT_ARGS,
  DEFAULT_CONTEXT_LENGTH,
  DEFAULT_MAX_BATCH_SIZE,
  DEFAULT_MAX_CHUNK_SIZE,
  DEFAULT_MAX_TOKENS,
  LLMConfigurationStatuses,
} from "./constants.js";
import {
  compileChatMessages,
  countTokens,
  pruneRawPromptFromTop,
} from "./countTokens.js";
import {
  fromChatCompletionChunk,
  fromChatResponse,
  LlmApiRequestType,
  toChatBody,
  toCompleteBody,
  toFimBody,
} from "./openaiTypeConverters.js";

export class LLMError extends Error {
  constructor(
    message: string,
    public llm: ILLM,
  ) {
    super(message);
  }
}

export function isModelInstaller(provider: any): provider is ModelInstaller {
  return (
    provider &&
    typeof provider.installModel === "function" &&
    typeof provider.isInstallingModel === "function"
  );
}

type InteractionStatus = "in_progress" | "success" | "error" | "cancelled";

export abstract class BaseLLM implements ILLM {
  static providerName: string;
  static defaultOptions: Partial<LLMOptions> | undefined = undefined;

  get providerName(): string {
    return (this.constructor as typeof BaseLLM).providerName;
  }

  /**
   * This exists because for the continue-proxy, sometimes we want to get the value of the underlying provider that is used on the server
   * For example, the underlying provider should always be sent with dev data
   */
  get underlyingProviderName(): string {
    return this.providerName;
  }

  autocompleteOptions?: Partial<TabAutocompleteOptions>;

  supportsFim(): boolean {
    return false;
  }

  supportsImages(): boolean {
    return modelSupportsImages(
      this.providerName,
      this.model,
      this.title,
      this.capabilities,
    );
  }

  supportsCompletions(): boolean {
    if (["openai", "azure"].includes(this.providerName)) {
      if (
        this.apiBase?.includes("api.groq.com") ||
        this.apiBase?.includes("api.mistral.ai") ||
        this.apiBase?.includes(":1337") ||
        this.apiBase?.includes("integrate.api.nvidia.com") ||
        this._llmOptions.useLegacyCompletionsEndpoint?.valueOf() === false
      ) {
        // Jan + Groq + Mistral don't support completions : (
        // Seems to be going out of style...
        return false;
      }
    }
    if (["groq", "mistral", "deepseek"].includes(this.providerName)) {
      return false;
    }
    return true;
  }

  supportsPrefill(): boolean {
    return ["ollama", "anthropic", "mistral"].includes(this.providerName);
  }

  uniqueId: string;
  model: string;

  title?: string;
  baseChatSystemMessage?: string;
  basePlanSystemMessage?: string;
  baseAgentSystemMessage?: string;
  contextLength: number;
  maxStopWords?: number | undefined;
  completionOptions: CompletionOptions;
  requestOptions?: RequestOptions;
  template?: TemplateType;
  promptTemplates?: Record<string, PromptTemplate>;
  templateMessages?: (messages: ChatMessage[]) => string;
  logger?: ILLMLogger;
  llmRequestHook?: (model: string, prompt: string) => any;
  apiKey?: string;

  // continueProperties
  apiKeyLocation?: string;
  envSecretLocations?: Record<string, string>;
  apiBase?: string;
  orgScopeId?: string | null;

  onPremProxyUrl?: string | null;

  cacheBehavior?: CacheBehavior;
  capabilities?: ModelCapability;
  roles?: ModelRole[];

  deployment?: string;
  apiVersion?: string;
  apiType?: string;
  region?: string;
  projectId?: string;
  accountId?: string;
  aiGatewaySlug?: string;
  profile?: string | undefined;
  accessKeyId?: string;
  secretAccessKey?: string;

  // For IBM watsonx
  deploymentId?: string;

  // Embedding options
  embeddingId: string;
  maxEmbeddingChunkSize: number;
  maxEmbeddingBatchSize: number;

  private _llmOptions: LLMOptions;

  protected openaiAdapter?: BaseLlmApi;

  constructor(_options: LLMOptions) {
    this._llmOptions = _options;

    // Set default options
    const options = {
      title: (this.constructor as typeof BaseLLM).providerName,
      ...(this.constructor as typeof BaseLLM).defaultOptions,
      ..._options,
    };

    this.model = options.model;
    // Use @continuedev/llm-info package to autodetect certain parameters
    const modelSearchString =
      this.providerName === "continue-proxy"
        ? this.model?.split("/").pop() || this.model
        : this.model;
    const llmInfo = findLlmInfo(modelSearchString);

    const templateType =
      options.template ?? autodetectTemplateType(options.model);

    this.title = options.title;
    this.uniqueId = options.uniqueId ?? "None";
    this.baseAgentSystemMessage = options.baseAgentSystemMessage;
    this.basePlanSystemMessage = options.basePlanSystemMessage;
    this.baseChatSystemMessage = options.baseChatSystemMessage;
    this.contextLength =
      options.contextLength ?? llmInfo?.contextLength ?? DEFAULT_CONTEXT_LENGTH;
    this.maxStopWords = options.maxStopWords ?? this.maxStopWords;
    this.completionOptions = {
      ...options.completionOptions,
      model: options.model || "gpt-4",
      maxTokens:
        options.completionOptions?.maxTokens ??
        (llmInfo?.maxCompletionTokens
          ? Math.min(
            llmInfo.maxCompletionTokens,
            // Even if the model has a large maxTokens, we don't want to use that every time,
            // because it takes away from the context length
            this.contextLength / 4,
          )
          : DEFAULT_MAX_TOKENS),
    };
    this.requestOptions = options.requestOptions;
    this.promptTemplates = {
      ...autodetectPromptTemplates(options.model, templateType),
      ...options.promptTemplates,
    };
    this.templateMessages =
      options.templateMessages ??
      autodetectTemplateFunction(
        options.model,
        this.providerName,
        options.template,
      ) ??
      undefined;
    this.logger = options.logger;
    this.llmRequestHook = options.llmRequestHook;
    this.apiKey = options.apiKey;

    // continueProperties
    this.apiKeyLocation = options.apiKeyLocation;
    this.envSecretLocations = options.envSecretLocations;
    this.orgScopeId = options.orgScopeId;
    this.apiBase = options.apiBase;

    this.onPremProxyUrl = options.onPremProxyUrl;

    this.aiGatewaySlug = options.aiGatewaySlug;
    this.cacheBehavior = options.cacheBehavior;

    // watsonx deploymentId
    this.deploymentId = options.deploymentId;

    if (this.apiBase && !this.apiBase.endsWith("/")) {
      this.apiBase = `${this.apiBase}/`;
    }
    this.accountId = options.accountId;
    this.capabilities = options.capabilities;
    this.roles = options.roles;

    this.deployment = options.deployment;
    this.apiVersion = options.apiVersion;
    this.apiType = options.apiType;
    this.region = options.region;
    this.projectId = options.projectId;
    this.profile = options.profile;
    this.accessKeyId = options.accessKeyId;
    this.secretAccessKey = options.secretAccessKey;

    this.openaiAdapter = this.createOpenAiAdapter();

    this.maxEmbeddingBatchSize =
      options.maxEmbeddingBatchSize ?? DEFAULT_MAX_BATCH_SIZE;
    this.maxEmbeddingChunkSize =
      options.maxEmbeddingChunkSize ?? DEFAULT_MAX_CHUNK_SIZE;
    this.embeddingId = `${this.constructor.name}::${this.model}::${this.maxEmbeddingChunkSize}`;

    this.autocompleteOptions = options.autocompleteOptions;
  }

  getConfigurationStatus() {
    return LLMConfigurationStatuses.VALID;
  }

  protected createOpenAiAdapter() {
    return constructLlmApi({
      provider: this.providerName as any,
      apiKey: this.apiKey ?? "",
      apiBase: this.apiBase,
      requestOptions: this.requestOptions,
      env: this._llmOptions.env,
    });
  }

  listModels(): Promise<string[]> {
    return Promise.resolve([]);
  }

  private _templatePromptLikeMessages(prompt: string): string {
    if (!this.templateMessages) {
      return prompt;
    }

    // NOTE system message no longer supported here

    const msgs: ChatMessage[] = [{ role: "user", content: prompt }];

    return this.templateMessages(msgs);
  }

  private _logEnd(
    model: string,
    prompt: string,
    completion: string,
    thinking: string | undefined,
    interaction: ILLMInteractionLog | undefined,
    error?: any,
  ): InteractionStatus {
    let promptTokens = this.countTokens(prompt);
    let generatedTokens = this.countTokens(completion);
    let thinkingTokens = thinking ? this.countTokens(thinking) : 0;

    void Telemetry.capture(
      "tokens_generated",
      {
        model: model,
        provider: this.providerName,
        promptTokens: promptTokens,
        generatedTokens: generatedTokens,
      },
      true,
    );

    void DevDataSqliteDb.logTokensGenerated(
      model,
      this.providerName,
      promptTokens,
      generatedTokens,
    );

    void DataLogger.getInstance().logDevData({
      name: "tokensGenerated",
      data: {
        model: model,
        provider: this.underlyingProviderName,
        promptTokens: promptTokens,
        generatedTokens: generatedTokens,
      },
    });

    if (error !== undefined) {
      if (error === "cancel" || error.name === "AbortError") {
        interaction?.logItem({
          kind: "cancel",
          promptTokens,
          generatedTokens,
          thinkingTokens,
        });
        return "cancelled";
      } else {
        console.log(error);
        interaction?.logItem({
          kind: "error",
          name: error.name,
          message: error.message,
          promptTokens,
          generatedTokens,
          thinkingTokens,
        });
        return "error";
      }
    } else {
      interaction?.logItem({
        kind: "success",
        promptTokens,
        generatedTokens,
        thinkingTokens,
      });
      return "success";
    }
  }

  private async parseError(resp: any): Promise<Error> {
    let text = await resp.text();

    if (resp.status === 404 && !resp.url.includes("/v1")) {
      const parsedError = JSON.parse(text);
      const errorMessageRaw = parsedError?.error ?? parsedError?.message;
      const error =
        typeof errorMessageRaw === "string"
          ? errorMessageRaw.replace(/"/g, "'")
          : undefined;
      let model = error?.match(/model '(.*)' not found/)?.[1];
      if (model && resp.url.match("127.0.0.1:11434")) {
        text = `The model "${model}" was not found. To download it, run \`ollama run ${model}\`.`;
        return new LLMError(text, this); // No need to add HTTP status details
      } else if (text.includes("/api/chat")) {
        text =
          "The /api/chat endpoint was not found. This may mean that you are using an older version of Ollama that does not support /api/chat. Upgrading to the latest version will solve the issue.";
      } else {
        text =
          "This may mean that you forgot to add '/v1' to the end of your 'apiBase' in config.json.";
      }
    } else if (resp.status === 404 && resp.url.includes("api.openai.com")) {
      text =
        "You may need to add pre-paid credits before using the OpenAI API.";
    } else if (
      resp.status === 401 &&
      (resp.url.includes("api.mistral.ai") ||
        resp.url.includes("codestral.mistral.ai"))
    ) {
      if (resp.url.includes("codestral.mistral.ai")) {
        return new Error(
          "You are using a Mistral API key, which is not compatible with the Codestral API. Please either obtain a Codestral API key, or use the Mistral API by setting 'apiBase' to 'https://api.mistral.ai/v1' in config.json.",
        );
      } else {
        return new Error(
          "You are using a Codestral API key, which is not compatible with the Mistral API. Please either obtain a Mistral API key, or use the the Codestral API by setting 'apiBase' to 'https://codestral.mistral.ai/v1' in config.json.",
        );
      }
    }
    return new Error(
      `HTTP ${resp.status} ${resp.statusText} from ${resp.url}\n\n${text}`,
    );
  }

  fetch(url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Custom Node.js fetch
    const customFetch = async (input: URL | RequestInfo, init: any) => {
      try {
        const resp = await fetchwithRequestOptions(
          new URL(input as any),
          { ...init },
          { ...this.requestOptions },
        );

        // Error mapping to be more helpful
        if (!resp.ok) {
          if (resp.status === 499) {
            return resp; // client side cancellation
          }

          const error = await this.parseError(resp);
          throw error;
        }

        return resp;
      } catch (e: any) {
        // Errors to ignore
        if (e.message.includes("/api/tags")) {
          throw new Error(`Error fetching tags: ${e.message}`);
        } else if (e.message.includes("/api/show")) {
          throw new Error(
            `HTTP ${e.response.status} ${e.response.statusText} from ${e.response.url}\n\n${e.response.body}`,
          );
        } else {
          if (e.name !== "AbortError") {
            // Don't pollute console with abort errors. Check on name instead of instanceof, to avoid importing node-fetch here
            console.debug(
              `${e.message}\n\nCode: ${e.code}\nError number: ${e.errno}\nSyscall: ${e.erroredSysCall}\nType: ${e.type}\n\n${e.stack}`,
            );
          }
          if (
            e.code === "ECONNREFUSED" &&
            e.message.includes("http://127.0.0.1:11434")
          ) {
            const message = (await isOllamaInstalled())
              ? "Unable to connect to local Ollama instance. Ollama may not be running."
              : "Unable to connect to local Ollama instance. Ollama may not be installed or may not running.";
            throw new Error(message);
          }
        }
        throw e;
      }
    };
    return withExponentialBackoff<Response>(
      () => customFetch(url, init) as any,
      5,
      0.5,
    );
  }

  private _parseCompletionOptions(options: LLMFullCompletionOptions) {
    const log = options.log ?? true;
    const raw = options.raw ?? false;
    options.log = undefined;

    const completionOptions: CompletionOptions = mergeJson(
      this.completionOptions,
      options,
    );

    return { completionOptions, logEnabled: log, raw };
  }

  private _formatChatMessages(messages: ChatMessage[]): string {
    const msgsCopy = messages ? messages.map((msg) => ({ ...msg })) : [];
    let formatted = "";
    for (const msg of msgsCopy) {
      formatted += this._formatChatMessage(msg);
    }
    return formatted;
  }

  private _formatChatMessage(msg: ChatMessage): string {
    let contentToShow = "";
    if (msg.role === "tool") {
      contentToShow = msg.content;
    } else if (msg.role === "assistant" && msg.toolCalls) {
      contentToShow = msg.toolCalls
        ?.map(
          (toolCall) =>
            `${toolCall.function?.name}(${toolCall.function?.arguments})`,
        )
        .join("\n");
    } else if ("content" in msg) {
      if (Array.isArray(msg.content)) {
        msg.content = renderChatMessage(msg);
      }
      contentToShow = msg.content;
    }

    return `<${msg.role}>\n${contentToShow}\n\n`;
  }

  protected async *_streamFim(
    prefix: string,
    suffix: string,
    signal: AbortSignal,
    options: CompletionOptions,
  ): AsyncGenerator<string, PromptLog> {
    throw new Error("Not implemented");
  }

  protected useOpenAIAdapterFor: (LlmApiRequestType | "*")[] = [];

  private shouldUseOpenAIAdapter(requestType: LlmApiRequestType) {
    return (
      this.useOpenAIAdapterFor.includes(requestType) ||
      this.useOpenAIAdapterFor.includes("*")
    );
  }

  async *streamFim(
    prefix: string,
    suffix: string,
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {},
  ): AsyncGenerator<string> {
    const { completionOptions, logEnabled } =
      this._parseCompletionOptions(options);
    const interaction = logEnabled
      ? this.logger?.createInteractionLog()
      : undefined;
    let status: InteractionStatus = "in_progress";

    const fimLog = `Prefix: ${prefix}\nSuffix: ${suffix}`;
    if (logEnabled) {
      interaction?.logItem({
        kind: "startFim",
        prefix,
        suffix,
        options: completionOptions,
      });
      if (this.llmRequestHook) {
        this.llmRequestHook(completionOptions.model, fimLog);
      }
    }

    let completion = "";
    try {
      if (this.shouldUseOpenAIAdapter("streamFim") && this.openaiAdapter) {
        const stream = this.openaiAdapter.fimStream(
          toFimBody(prefix, suffix, completionOptions),
          signal,
        );
        for await (const chunk of stream) {
          const result = fromChatCompletionChunk(chunk);
          if (result) {
            const content = renderChatMessage(result);
            const formattedContent = this._formatChatMessage(result);
            interaction?.logItem({
              kind: "chunk",
              chunk: formattedContent,
            });
            completion += formattedContent;
            yield content;
          }
        }
      } else {
        for await (const chunk of this._streamFim(
          prefix,
          suffix,
          signal,
          completionOptions,
        )) {
          interaction?.logItem({
            kind: "chunk",
            chunk,
          });
          completion += chunk;
          yield chunk;
        }
      }

      status = this._logEnd(
        completionOptions.model,
        fimLog,
        completion,
        undefined,
        interaction,
      );
    } catch (e) {
      status = this._logEnd(
        completionOptions.model,
        fimLog,
        completion,
        undefined,
        interaction,
        e,
      );
      throw e;
    } finally {
      if (status === "in_progress") {
        this._logEnd(
          completionOptions.model,
          fimLog,
          completion,
          undefined,
          interaction,
          "cancel",
        );
      }
    }

    return {
      prompt: fimLog,
      completion,
      completionOptions,
    };
  }

  async *streamComplete(
    _prompt: string,
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {},
  ) {
    const { completionOptions, logEnabled, raw } =
      this._parseCompletionOptions(options);
    const interaction = logEnabled
      ? this.logger?.createInteractionLog()
      : undefined;
    let status: InteractionStatus = "in_progress";

    let prompt = pruneRawPromptFromTop(
      completionOptions.model,
      this.contextLength,
      _prompt,
      completionOptions.maxTokens ?? DEFAULT_MAX_TOKENS,
    );

    if (!raw) {
      prompt = this._templatePromptLikeMessages(prompt);
    }

    if (logEnabled) {
      interaction?.logItem({
        kind: "startComplete",
        prompt,
        options: completionOptions,
      });
      if (this.llmRequestHook) {
        this.llmRequestHook(completionOptions.model, prompt);
      }
    }

    let completion = "";
    try {
      if (this.shouldUseOpenAIAdapter("streamComplete") && this.openaiAdapter) {
        if (completionOptions.stream === false) {
          // Stream false
          const response = await this.openaiAdapter.completionNonStream(
            { ...toCompleteBody(prompt, completionOptions), stream: false },
            signal,
          );
          completion = response.choices[0]?.text ?? "";
          yield completion;
        } else {
          // Stream true
          for await (const chunk of this.openaiAdapter.completionStream(
            {
              ...toCompleteBody(prompt, completionOptions),
              stream: true,
            },
            signal,
          )) {
            const content = chunk.choices[0]?.text ?? "";
            completion += content;
            interaction?.logItem({
              kind: "chunk",
              chunk: content,
            });
            yield content;
          }
        }
      } else {
        for await (const chunk of this._streamComplete(
          prompt,
          signal,
          completionOptions,
        )) {
          completion += chunk;
          interaction?.logItem({
            kind: "chunk",
            chunk,
          });
          yield chunk;
        }
      }
      status = this._logEnd(
        completionOptions.model,
        prompt,
        completion,
        undefined,
        interaction,
      );
    } catch (e) {
      status = this._logEnd(
        completionOptions.model,
        prompt,
        completion,
        undefined,
        interaction,
        e,
      );
      throw e;
    } finally {
      if (status === "in_progress") {
        this._logEnd(
          completionOptions.model,
          prompt,
          completion,
          undefined,
          interaction,
          "cancel",
        );
      }
    }

    return {
      modelTitle: this.title ?? completionOptions.model,
      prompt,
      completion,
      completionOptions,
    };
  }

  async complete(
    _prompt: string,
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {},
  ) {
    const { completionOptions, logEnabled, raw } =
      this._parseCompletionOptions(options);
    const interaction = logEnabled
      ? this.logger?.createInteractionLog()
      : undefined;
    let status: InteractionStatus = "in_progress";

    let prompt = pruneRawPromptFromTop(
      completionOptions.model,
      this.contextLength,
      _prompt,
      completionOptions.maxTokens ?? DEFAULT_MAX_TOKENS,
    );

    if (!raw) {
      prompt = this._templatePromptLikeMessages(prompt);
    }

    if (logEnabled) {
      interaction?.logItem({
        kind: "startComplete",
        prompt: prompt,
        options: completionOptions,
      });
      if (this.llmRequestHook) {
        this.llmRequestHook(completionOptions.model, prompt);
      }
    }

    let completion: string = "";

    try {
      if (this.shouldUseOpenAIAdapter("complete") && this.openaiAdapter) {
        const result = await this.openaiAdapter.completionNonStream(
          {
            ...toCompleteBody(prompt, completionOptions),
            stream: false,
          },
          signal,
        );
        completion = result.choices[0].text;
      } else {
        completion = await this._complete(prompt, signal, completionOptions);
      }

      interaction?.logItem({
        kind: "chunk",
        chunk: completion,
      });

      status = this._logEnd(
        completionOptions.model,
        prompt,
        completion,
        undefined,
        interaction,
      );
    } catch (e) {
      status = this._logEnd(
        completionOptions.model,
        prompt,
        completion,
        undefined,
        interaction,
        e,
      );
      throw e;
    } finally {
      if (status === "in_progress") {
        this._logEnd(
          completionOptions.model,
          prompt,
          completion,
          undefined,
          interaction,
          "cancel",
        );
      }
    }

    return completion;
  }

  async chat(
    messages: ChatMessage[],
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {},
  ) {
    let completion = "";
    for await (const message of this.streamChat(messages, signal, options)) {
      completion += renderChatMessage(message);
    }
    return { role: "assistant" as const, content: completion };
  }

  protected modifyChatBody(
    body: ChatCompletionCreateParams,
  ): ChatCompletionCreateParams {
    return body;
  }

  private _modifyCompletionOptions(
    completionOptions: CompletionOptions,
  ): CompletionOptions {
    // As of 01/14/25 streaming is currently not available with o1
    // See these threads:
    // - https://github.com/continuedev/continue/issues/3698
    // - https://community.openai.com/t/streaming-support-for-o1-o1-2024-12-17-resulting-in-400-unsupported-value/1085043
    if (completionOptions.model === "o1") {
      completionOptions.stream = false;
    }

    return completionOptions;
  }

  async *streamChat(
    _messages: ChatMessage[],
    signal: AbortSignal,
    options: LLMFullCompletionOptions = {},
  ): AsyncGenerator<ChatMessage, PromptLog> {
    let { completionOptions, logEnabled } =
      this._parseCompletionOptions(options);
    const interaction = logEnabled
      ? this.logger?.createInteractionLog()
      : undefined;
    let status: InteractionStatus = "in_progress";

    completionOptions = this._modifyCompletionOptions(completionOptions);

    const messages = compileChatMessages({
      modelName: completionOptions.model,
      msgs: _messages,
      contextLength: this.contextLength,
      maxTokens: completionOptions.maxTokens ?? DEFAULT_MAX_TOKENS,
      supportsImages: this.supportsImages(),
      tools: options.tools,
    });

    const prompt = this.templateMessages
      ? this.templateMessages(messages)
      : this._formatChatMessages(messages);
    if (logEnabled) {
      interaction?.logItem({
        kind: "startChat",
        messages,
        options: completionOptions,
      });
      if (this.llmRequestHook) {
        this.llmRequestHook(completionOptions.model, prompt);
      }
    }

    let thinking = "";
    let completion = "";

    try {
      if (this.templateMessages) {
        for await (const chunk of this._streamComplete(
          prompt,
          signal,
          completionOptions,
        )) {
          completion += chunk;
          interaction?.logItem({
            kind: "chunk",
            chunk: chunk,
          });
          yield { role: "assistant", content: chunk };
        }
      } else {
        if (this.shouldUseOpenAIAdapter("streamChat") && this.openaiAdapter) {
          let body = toChatBody(messages, completionOptions);
          body = this.modifyChatBody(body);

          if (completionOptions.stream === false) {
            // Stream false
            const response = await this.openaiAdapter.chatCompletionNonStream(
              { ...body, stream: false },
              signal,
            );
            const msg = fromChatResponse(response);
            yield msg;
            completion = this._formatChatMessage(msg);
          } else {
            // Stream true
            const stream = this.openaiAdapter.chatCompletionStream(
              {
                ...body,
                stream: true,
              },
              signal,
            );
            for await (const chunk of stream) {
              const result = fromChatCompletionChunk(chunk);
              if (result) {
                completion += this._formatChatMessage(result);
                interaction?.logItem({
                  kind: "message",
                  message: result,
                });
                yield result;
              }
            }
          }
        } else {
          for await (const chunk of this._streamChat(
            messages,
            signal,
            completionOptions,
          )) {
            if (chunk.role === "assistant") {
              completion += this._formatChatMessage(chunk);
            } else if (chunk.role === "thinking") {
              thinking += chunk.content;
            }

            interaction?.logItem({
              kind: "message",
              message: chunk,
            });
            yield chunk;
          }
        }
      }
      status = this._logEnd(
        completionOptions.model,
        prompt,
        completion,
        thinking,
        interaction,
      );
    } catch (e) {
      status = this._logEnd(
        completionOptions.model,
        prompt,
        completion,
        thinking,
        interaction,
        e,
      );
      throw e;
    } finally {
      if (status === "in_progress") {
        this._logEnd(
          completionOptions.model,
          prompt,
          completion,
          undefined,
          interaction,
          "cancel",
        );
      }
    }
    /*
    TODO: According to: https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
    During tool use, you must pass thinking and redacted_thinking blocks back to the API,
    and you must include the complete unmodified block back to the API. This is critical
    for maintaining the model's reasoning flow and conversation integrity.

    On the other hand, adding thinking and redacted_thinking blocks are ignored on subsequent
    requests when not using tools, so it's the simplest option to always add to history.
    */

    return {
      modelTitle: this.title ?? completionOptions.model,
      prompt,
      completion,
      completionOptions,
    };
  }

  getBatchedChunks(chunks: string[]): string[][] {
    const batchedChunks = [];

    for (let i = 0; i < chunks.length; i += this.maxEmbeddingBatchSize) {
      batchedChunks.push(chunks.slice(i, i + this.maxEmbeddingBatchSize));
    }

    return batchedChunks;
  }

  async embed(chunks: string[]): Promise<number[][]> {
    const batches = this.getBatchedChunks(chunks);

    return (
      await Promise.all(
        batches.map(async (batch) => {
          if (batch.length === 0) {
            return [];
          }

          const embeddings = await withExponentialBackoff<number[][]>(
            async () => {
              if (this.shouldUseOpenAIAdapter("embed") && this.openaiAdapter) {
                const result = await this.openaiAdapter.embed({
                  model: this.model,
                  input: batch,
                });
                return result.data.map((chunk) => chunk.embedding);
              }

              return await this._embed(batch);
            },
          );

          return embeddings;
        }),
      )
    ).flat();
  }

  async rerank(query: string, chunks: Chunk[]): Promise<number[]> {
    if (this.shouldUseOpenAIAdapter("rerank") && this.openaiAdapter) {
      const results = await this.openaiAdapter.rerank({
        model: this.model,
        query,
        documents: chunks.map((chunk) => chunk.content),
      });

      // Standard OpenAI format
      if (results.data && Array.isArray(results.data)) {
        return results.data
          .sort((a, b) => a.index - b.index)
          .map((result) => result.relevance_score);
      }

      throw new Error(
        `Unexpected rerank response format from ${this.providerName}. ` +
        `Expected 'data' array but got: ${JSON.stringify(Object.keys(results))}`,
      );
    }

    throw new Error(
      `Reranking is not supported for provider type ${this.providerName}`,
    );
  }

  protected async *_streamComplete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions,
  ): AsyncGenerator<string> {
    throw new Error("Not implemented");
  }

  protected async *_streamChat(
    messages: ChatMessage[],
    signal: AbortSignal,
    options: CompletionOptions,
  ): AsyncGenerator<ChatMessage> {
    if (!this.templateMessages) {
      throw new Error(
        "You must either implement templateMessages or _streamChat",
      );
    }

    for await (const chunk of this._streamComplete(
      this.templateMessages(messages),
      signal,
      options,
    )) {
      yield { role: "assistant", content: chunk };
    }
  }

  protected async _complete(
    prompt: string,
    signal: AbortSignal,
    options: CompletionOptions,
  ) {
    let completion = "";
    for await (const chunk of this._streamComplete(prompt, signal, options)) {
      completion += chunk;
    }
    return completion;
  }

  protected async _embed(chunks: string[]): Promise<number[][]> {
    throw new Error(
      `Embedding is not supported for provider type ${this.providerName}`,
    );
  }

  countTokens(text: string): number {
    return countTokens(text, this.model);
  }

  protected collectArgs(options: CompletionOptions): any {
    return {
      ...DEFAULT_ARGS,
      // model: this.model,
      ...options,
    };
  }

  public renderPromptTemplate(
    template: PromptTemplate,
    history: ChatMessage[],
    otherData: Record<string, string>,
    canPutWordsInModelsMouth = false,
  ): string | ChatMessage[] {
    if (typeof template === "string") {
      const data: any = {
        history: history,
        ...otherData,
      };
      if (history.length > 0 && history[0].role === "system") {
        data.system_message = history.shift()!.content;
      }

      const compiledTemplate = Handlebars.compile(template);
      return compiledTemplate(data);
    }
    const rendered = template(history, {
      ...otherData,
      supportsCompletions: this.supportsCompletions() ? "true" : "false",
      supportsPrefill: this.supportsPrefill() ? "true" : "false",
    });
    if (
      typeof rendered !== "string" &&
      rendered[rendered.length - 1]?.role === "assistant" &&
      !canPutWordsInModelsMouth
    ) {
      // Some providers don't allow you to put words in the model's mouth
      // So we have to manually compile the prompt template and use
      // raw /completions, not /chat/completions
      const templateMessages = autodetectTemplateFunction(
        this.model,
        this.providerName,
        autodetectTemplateType(this.model),
      );
      if (templateMessages) {
        return templateMessages(rendered);
      }
    }
    return rendered;
  }
}
