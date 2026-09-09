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
  createGetDeploymentsTool,
  createQueryPrometheusTool
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

    this.services = rows.results
      .map((row) => row.service)
      .sort((left, right) => {
        if (left === "search") return -1;
        if (right === "search") return 1;
        return left.localeCompare(right);
      });

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

      system: `${INCIDENT_INVESTIGATION_PROMPT}

    Authoritative services available for investigation: ${this.services.join(", ") || "none"}. Never invent or substitute a service name.`,

      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages",
        reasoning: "before-last-message"
      }),

      tools: {
        // MCP tools from connected servers.
        ...mcpTools,

        queryPrometheus: createQueryPrometheusTool({
          env: this.env,
          services: this.services
        }),
        fetchLokiLogs: createFetchLokiLogsTool({
          env: this.env,
          services: this.services
        }),
        getAwsScalingEvents: createGetAwsScalingEventsTool({
          env: this.env,
          services: this.services
        }),
        getDeployments: createGetDeploymentsTool({
          env: this.env,
          services: this.services
        })
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
