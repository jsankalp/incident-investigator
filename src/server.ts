import { createWorkersAI } from "workers-ai-provider";
import { callable, routeAgentRequest } from "agents";
import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText
} from "ai";
import { AGENT_MODEL, INCIDENT_INVESTIGATION_PROMPT } from "./constants";
import {
  createFetchLokiLogsTool,
  createGetAwsScalingEventsTool,
  createQueryPrometheusTool,
  getUserTimezoneTool
} from "./tools";

export class ChatAgent extends AIChatAgent<Env> {
  maxPersistedMessages = 100;
  chatRecovery = true;
  services: string[] = [];

  // Wait for MCP connections to be re-established after hibernation
  // before processing a message, so MCP tools aren't intermittently missing.
  waitForMcpConnections = true;

  async onStart() {
    const rows = await this.env.incident_db
      .prepare(
        `
          SELECT DISTINCT service
          FROM prom_metrics
          WHERE service IS NOT NULL AND trim(service) <> ''
          ORDER BY service ASC
        `
      )
      .all<{ service: string }>();

    this.services = rows.results.map((row) => row.service);

    // Configure OAuth popup behavior for MCP servers that require authentication.
    this.mcp.configureOAuthCallback({
      customHandler: (result) => {
        if (result.authSuccess) {
          return new Response("<script>window.close();</script>", {
            headers: { "content-type": "text/html" },
            status: 200
          });
        }

        return new Response(
          `Authentication Failed: ${result.authError || "Unknown error"}`,
          {
            headers: { "content-type": "text/plain" },
            status: 400
          }
        );
      }
    });
  }

  @callable()
  getServices() {
    return this.services;
  }

  @callable()
  async addServer(name: string, url: string) {
    return await this.addMcpServer(name, url);
  }

  @callable()
  async removeServer(serverId: string) {
    await this.removeMcpServer(serverId);
  }

  async onChatMessage(_onFinish: unknown, options?: OnChatMessageOptions) {
    const mcpTools = this.mcp.getAITools();
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai(AGENT_MODEL, {
        sessionAffinity: this.sessionAffinity
      }),

      system: INCIDENT_INVESTIGATION_PROMPT,

      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages",
        reasoning: "before-last-message"
      }),

      tools: {
        // MCP tools from connected servers.
        ...mcpTools,

        queryPrometheus: createQueryPrometheusTool({ env: this.env }),
        fetchLokiLogs: createFetchLokiLogsTool({ env: this.env }),
        getAwsScalingEvents: createGetAwsScalingEventsTool({ env: this.env }),
        getUserTimezone: getUserTimezoneTool
      },

      stopWhen: stepCountIs(20),
      abortSignal: options?.abortSignal
    });

    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env) {
    return (
      (await routeAgentRequest(request, env)) ||
      new Response("Not found", {
        status: 404
      })
    );
  }
} satisfies ExportedHandler<Env>;
