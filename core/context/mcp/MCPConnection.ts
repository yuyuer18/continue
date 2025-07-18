import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { WebSocketClientTransport } from "@modelcontextprotocol/sdk/client/websocket.js";

import {
  MCPConnectionStatus,
  MCPOptions,
  MCPPrompt,
  MCPResource,
  MCPResourceTemplate,
  MCPServerStatus,
  MCPTool,
} from "../..";
import { getEnvPathFromUserShell } from "../../util/shellPath";

const DEFAULT_MCP_TIMEOUT = 20_000; // 20 seconds

// Commands that are batch scripts on Windows and need cmd.exe to execute
const WINDOWS_BATCH_COMMANDS = [
  "npx",
  "uv",
  "uvx",
  "pnpx",
  "dlx",
  "nx",
  "bunx",
];

class MCPConnection {
  public client: Client;
  public abortController: AbortController;
  public status: MCPConnectionStatus = "not-connected";
  public errors: string[] = [];
  public prompts: MCPPrompt[] = [];
  public tools: MCPTool[] = [];
  public resources: MCPResource[] = [];
  public resourceTemplates: MCPResourceTemplate[] = [];
  private transport: Transport;
  private connectionPromise: Promise<unknown> | null = null;
  private stdioOutput: { stdout: string; stderr: string } = {
    stdout: "",
    stderr: "",
  };

  constructor(public options: MCPOptions) {
    // Don't construct transport in constructor to avoid blocking
    this.transport = {} as Transport; // Will be set in connectClient

    this.client = new Client(
      {
        name: "continue-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      },
    );

    this.abortController = new AbortController();
  }

  async disconnect() {
    this.abortController.abort();
    await this.client.close();
    await this.transport.close();
  }

  getStatus(): MCPServerStatus {
    return {
      ...this.options,
      errors: this.errors,
      prompts: this.prompts,
      resources: this.resources,
      resourceTemplates: this.resourceTemplates,
      tools: this.tools,
      status: this.status,
    };
  }

  async connectClient(forceRefresh: boolean, externalSignal: AbortSignal) {
    if (!forceRefresh) {
      // Already connected
      if (this.status === "connected") {
        return;
      }

      // Connection is already in progress; wait for it to complete
      if (this.connectionPromise) {
        await this.connectionPromise;
        return;
      }
    }

    this.status = "connecting";
    this.tools = [];
    this.prompts = [];
    this.resources = [];
    this.resourceTemplates = [];
    this.errors = [];
    this.stdioOutput = { stdout: "", stderr: "" };

    this.abortController.abort();
    this.abortController = new AbortController();

    this.connectionPromise = Promise.race([
      // If aborted by a refresh or other, cancel and don't do anything
      new Promise((resolve) => {
        externalSignal.addEventListener("abort", () => {
          resolve(undefined);
        });
      }),
      new Promise((resolve) => {
        this.abortController.signal.addEventListener("abort", () => {
          resolve(undefined);
        });
      }),
      (async () => {
        const timeoutController = new AbortController();
        const connectionTimeout = setTimeout(
          () => timeoutController.abort(),
          this.options.timeout ?? DEFAULT_MCP_TIMEOUT,
        );

        try {
          await Promise.race([
            new Promise((_, reject) => {
              timeoutController.signal.addEventListener("abort", () => {
                reject(new Error("连接超时"));
              });
            }),
            (async () => {
              this.transport = await this.constructTransportAsync(this.options);

              try {
                await this.client.connect(this.transport);
              } catch (error) {
                // Allow the case where for whatever reason is already connected
                if (
                  error instanceof Error &&
                  error.message.startsWith(
                    "StdioClientTransport already started",
                  )
                ) {
                  await this.client.close();
                  await this.client.connect(this.transport);
                } else {
                  throw error;
                }
              }

              // TODO register server notification handlers
              // this.client.transport?.onmessage(msg => console.log())
              // this.client.setNotificationHandler(, notification => {
              //   console.log(notification)
              // })

              const capabilities = this.client.getServerCapabilities();

              // Resources <—> Context Provider
              if (capabilities?.resources) {
                try {
                  const { resources } = await this.client.listResources(
                    {},
                    { signal: timeoutController.signal },
                  );
                  this.resources = resources;
                } catch (e) {
                  let errorMessage = `加载 MCP 服务器资源时出错 ${this.options.name}`;
                  if (e instanceof Error) {
                    errorMessage += `: ${e.message}`;
                  }
                  this.errors.push(errorMessage);
                }

                // Resource templates
                try {
                  const { resourceTemplates } =
                    await this.client.listResourceTemplates(
                      {},
                      { signal: timeoutController.signal },
                    );

                  this.resourceTemplates = resourceTemplates;
                } catch (e) {
                  let errorMessage = `Error loading resource templates for MCP Server ${this.options.name}`;
                  if (e instanceof Error) {
                    errorMessage += `: ${e.message}`;
                  }
                  this.errors.push(errorMessage);
                }
              }

              // Tools <—> Tools
              if (capabilities?.tools) {
                try {
                  const { tools } = await this.client.listTools(
                    {},
                    { signal: timeoutController.signal },
                  );
                  this.tools = tools;
                } catch (e) {
                  let errorMessage = `加载 MCP 服务器工具时出错 ${this.options.name}`;
                  if (e instanceof Error) {
                    errorMessage += `: ${e.message}`;
                  }
                  this.errors.push(errorMessage);
                }
              }

              // Prompts <—> Slash commands
              if (capabilities?.prompts) {
                try {
                  const { prompts } = await this.client.listPrompts(
                    {},
                    { signal: timeoutController.signal },
                  );
                  this.prompts = prompts;
                } catch (e) {
                  let errorMessage = `加载 MCP 服务器提示时出错 ${this.options.name}`;
                  if (e instanceof Error) {
                    errorMessage += `: ${e.message}`;
                  }
                  this.errors.push(errorMessage);
                }
              }

              this.status = "connected";
            })(),
          ]);
        } catch (error) {
          // Otherwise it's a connection error
          let errorMessage = `链接失败 "${this.options.name}"\n`;
          if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (msg.includes("spawn") && msg.includes("enoent")) {
              const command = msg.split(" ")[1];
              errorMessage += `Error: 命令 "${command}" 未找到. 使用MCP服务，需要安装 ${command} CLI.`;
            } else {
              errorMessage += "Error: " + error.message;
            }
          }

          // Include stdio output if available for stdio transport
          if (
            this.options.transport.type === "stdio" &&
            (this.stdioOutput.stdout || this.stdioOutput.stderr)
          ) {
            errorMessage += "\n\nProcess output:";
            if (this.stdioOutput.stdout) {
              errorMessage += `\nSTDOUT:\n${this.stdioOutput.stdout}`;
            }
            if (this.stdioOutput.stderr) {
              errorMessage += `\nSTDERR:\n${this.stdioOutput.stderr}`;
            }
          }

          this.status = "error";
          this.errors.push(errorMessage);
        } finally {
          this.connectionPromise = null;
          clearTimeout(connectionTimeout);
        }
      })(),
    ]);

    await this.connectionPromise;
  }

  /**
   * Resolves the command and arguments for the current platform
   * On Windows, batch script commands need to be executed via cmd.exe
   * @param originalCommand The original command
   * @param originalArgs The original command arguments
   * @returns An object with the resolved command and arguments
   */
  private resolveCommandForPlatform(
    originalCommand: string,
    originalArgs: string[],
  ): { command: string; args: string[] } {
    // If not on Windows or not a batch command, return as-is
    if (
      process.platform !== "win32" ||
      !WINDOWS_BATCH_COMMANDS.includes(originalCommand)
    ) {
      return { command: originalCommand, args: originalArgs };
    }

    // On Windows, we need to execute batch commands via cmd.exe
    // Format: cmd.exe /c command [args]
    return {
      command: "cmd.exe",
      args: ["/c", originalCommand, ...originalArgs],
    };
  }

  private async constructTransportAsync(
    options: MCPOptions,
  ): Promise<Transport> {
    switch (options.transport.type) {
      case "stdio":
        const env: Record<string, string> = options.transport.env
          ? { ...options.transport.env }
          : {};

        if (process.env.PATH !== undefined) {
          // Set the initial PATH from process.env
          env.PATH = process.env.PATH;

          // For non-Windows platforms, try to get the PATH from user shell
          if (process.platform !== "win32") {
            try {
              const shellEnvPath = await getEnvPathFromUserShell();
              if (shellEnvPath && shellEnvPath !== process.env.PATH) {
                env.PATH = shellEnvPath;
              }
            } catch (err) {
              console.error("Error getting PATH:", err);
            }
          }
        }

        // Resolve the command and args for the current platform
        const { command, args } = this.resolveCommandForPlatform(
          options.transport.command,
          options.transport.args || [],
        );

        const transport = new StdioClientTransport({
          command,
          args,
          env,
          cwd: options.transport.cwd,
          stderr: "pipe",
        });

        // Capture stdio output for better error reporting

        transport.stderr?.on("data", (data: Buffer) => {
          this.stdioOutput.stderr += data.toString();
        });

        return transport;
      case "websocket":
        return new WebSocketClientTransport(new URL(options.transport.url));
      case "sse":
        return new SSEClientTransport(new URL(options.transport.url), {
          eventSourceInit: {
            fetch: (input, init) =>
              fetch(input, {
                ...init,
                headers: {
                  ...init?.headers,
                  ...(options.transport.requestOptions?.headers as
                    | Record<string, string>
                    | undefined),
                },
              }),
          },
          requestInit: { headers: options.transport.requestOptions?.headers },
        });
      case "streamable-http":
        return new StreamableHTTPClientTransport(
          new URL(options.transport.url),
          {
            requestInit: { headers: options.transport.requestOptions?.headers },
          },
        );
      default:
        throw new Error(
          `Unsupported transport type: ${(options.transport as any).type}`,
        );
    }
  }
}

export default MCPConnection;
