import { createWorkersAI } from "workers-ai-provider";
import { callable, routeAgentRequest, type Schedule } from "agents";
import { getSchedulePrompt, scheduleSchema } from "agents/schedule";
import { AIChatAgent, type OnChatMessageOptions } from "@cloudflare/ai-chat";
import {
  convertToModelMessages,
  pruneMessages,
  stepCountIs,
  streamText,
  tool
} from "ai";
import { z } from "zod";

export class ChatAgent extends AIChatAgent<Env> {
  maxPersistedMessages = 100;
  chatRecovery = true;

  // Wait for MCP connections to be re-established after hibernation
  // before processing a message, so MCP tools aren't intermittently missing.
  waitForMcpConnections = true;

  onStart() {
    void this.ensureIncidentDataSeed();

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
  async addServer(name: string, url: string) {
    return await this.addMcpServer(name, url);
  }

  @callable()
  async removeServer(serverId: string) {
    await this.removeMcpServer(serverId);
  }

  private async ensureIncidentDataSeed() {
    const db = this.env.incident_db;
    if (!db) {
      return;
    }

    try {
      const existing = await db
        .prepare("SELECT COUNT(*) AS count FROM loki_logs")
        .first<{ count: number }>();

      if (existing && Number(existing.count) > 0) {
        return;
      }

      const logs = [
        {
          timestamp: "14:02:51",
          level: "INFO",
          message: "Deployment checkout-v42 completed",
          service: "checkout"
        },
        {
          timestamp: "14:03:12",
          level: "ERROR",
          message: "Connection pool exhausted",
          service: "checkout"
        },
        {
          timestamp: "14:03:45",
          level: "ERROR",
          message: "Failed to acquire database connection",
          service: "checkout"
        },
        {
          timestamp: "14:04:02",
          level: "ERROR",
          message: "Request timeout while calling payment-service",
          service: "checkout"
        },
        {
          timestamp: "14:04:31",
          level: "ERROR",
          message: "Request timeout while calling payment-service",
          service: "checkout"
        },
        {
          timestamp: "14:05:17",
          level: "ERROR",
          message: "Request timeout while calling payment-service",
          service: "checkout"
        },
        {
          timestamp: "14:05:42",
          level: "ERROR",
          message: "Request timeout while calling payment-service",
          service: "checkout"
        }
      ];

      const events = [
        {
          timestamp: "14:01:48",
          type: "SCALE_OUT",
          previousCapacity: 4,
          newCapacity: 8,
          reason: "CPU utilization exceeded target",
          service: "checkout"
        },
        {
          timestamp: "14:02:18",
          type: "TASKS_STABILIZED",
          capacity: 8,
          reason: "Desired task count reached",
          service: "checkout"
        },
        {
          timestamp: "14:07:42",
          type: "SCALE_OUT",
          previousCapacity: 8,
          newCapacity: 12,
          reason: "Request count exceeded target",
          service: "checkout"
        }
      ];

      await db.batch([
        db.prepare(`
          CREATE TABLE IF NOT EXISTS loki_logs (
            service TEXT,
            timestamp TEXT,
            level TEXT,
            message TEXT
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS scaling_events (
            service TEXT,
            timestamp TEXT,
            type TEXT,
            previousCapacity INTEGER,
            newCapacity INTEGER,
            capacity INTEGER,
            reason TEXT
          )
        `)
      ]);

      const logStatements = logs.map((entry) =>
        db.prepare(
          `INSERT INTO loki_logs (service, timestamp, level, message) VALUES (?, ?, ?, ?)`
        ).bind(entry.service, entry.timestamp, entry.level, entry.message)
      );

      const eventStatements = events.map((entry) =>
        db.prepare(
          `INSERT INTO scaling_events (service, timestamp, type, previousCapacity, newCapacity, capacity, reason) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          entry.service,
          entry.timestamp,
          entry.type,
          entry.previousCapacity ?? null,
          entry.newCapacity ?? null,
          entry.capacity ?? null,
          entry.reason
        )
      );

      if (logStatements.length > 0) {
        await db.batch(logStatements);
      }

      if (eventStatements.length > 0) {
        await db.batch(eventStatements);
      }

      const bucket = this.env.incident_bucket;
      if (bucket) {
        await bucket.put(
          "incident-data/loki_logs.json",
          JSON.stringify({ logs })
        );
        await bucket.put(
          "incident-data/scaling_events.json",
          JSON.stringify({ events })
        );
      }
    } catch (error) {
      console.warn("Incident seed initialization skipped:", error);
    }
  }

  async onChatMessage(
    _onFinish: unknown,
    options?: OnChatMessageOptions
  ) {
    const mcpTools = this.mcp.getAITools();
    const workersai = createWorkersAI({ binding: this.env.AI });

    const result = streamText({
      model: workersai("@cf/zai-org/glm-4.7-flash", {
        sessionAffinity: this.sessionAffinity
      }),

      system: `You are an incident investigation assistant.

You investigate production incidents by correlating signals from multiple observability sources.

Available observability tools:

- queryPrometheus: Use for service metrics such as latency, error rate, throughput, CPU, memory, and request volume. Generate an appropriate PromQL query.
- fetchLokiLogs: Use for application logs, errors, exceptions, timeouts, and other log events. Generate an appropriate LogQL query.
- getAwsScalingEvents: Use to determine whether AWS autoscaling activity or changes in service capacity occurred during the incident.

Investigation workflow:

1. Identify the affected service and the relevant time range.
2. Use Prometheus to inspect service health and identify metric anomalies.
3. Determine when the anomaly started and what changed.
4. Use Loki to inspect logs around the anomalous period.
5. Check AWS scaling events when infrastructure capacity could be relevant.
6. Correlate timestamps and evidence across the different sources.
7. Clearly distinguish observed facts from hypotheses.
8. Do not claim a root cause unless the available evidence supports it.
9. When possible, explain why alternative causes are less likely.

The observability tools are simulated for this environment. PromQL and LogQL are accepted as strings and are not actually validated or executed against real Prometheus or Loki servers.

Language policy: respond in English by default. If the user explicitly requests another language, then respond in that language instead. Do not mix languages unless the user asks for it.

${getSchedulePrompt({ date: new Date() })}

If the user asks to schedule a task, use the schedule tool to schedule the task.`,

      messages: pruneMessages({
        messages: await convertToModelMessages(this.messages),
        toolCalls: "before-last-2-messages",
        reasoning: "before-last-message"
      }),

      tools: {
        // MCP tools from connected servers.
        ...mcpTools,

        // ------------------------------------------------------------
        // Prometheus
        // ------------------------------------------------------------
        queryPrometheus: tool({
          description:
            "Query Prometheus metrics for a service during a time range. Use this to investigate latency, error rate, throughput, CPU, memory, request volume, or other service health metrics. Generate an appropriate PromQL query. The PromQL is simulated and is not validated or executed against a real Prometheus server.",

          inputSchema: z.object({
            service: z
              .string()
              .describe("Service name, for example checkout"),

            promql: z
              .string()
              .describe(
                'PromQL query generated for the investigation, for example rate(http_requests_total{service="checkout"}[5m])'
              ),

            start: z
              .string()
              .describe(
                "Start of the time range, for example 14:00"
              ),

            end: z
              .string()
              .describe(
                "End of the time range, for example 14:30"
              )
          }),

          execute: async ({
            service,
            promql,
            start,
            end
          }) => {
            // Simulated Prometheus time series.
            //
            // The data represents a latency incident:
            //
            // 14:00 -> 190ms
            // 14:01 -> 205ms
            // 14:02 -> 198ms
            // 14:03 -> 480ms
            // 14:04 -> 720ms
            // 14:05 -> 850ms
            //
            // PromQL is intentionally not parsed or validated.

            const values = [
              190,
              205,
              198,
              480,
              720,
              850
            ];

            const startMinutes = Number.parseInt(
              start.split(":")[1] ?? "0",
              10
            );

            const hour = start.split(":")[0] ?? "14";

            return {
              service,
              query: promql,
              start,
              end,
              metric: "http_request_duration_seconds",
              aggregation: "p95",
              unit: "ms",

              data: values.map((value, index) => ({
                timestamp: `${hour}:${String(
                  startMinutes + index
                ).padStart(2, "0")}`,
                value
              }))
            };
          }
        }),

        // ------------------------------------------------------------
        // Loki
        // ------------------------------------------------------------
        fetchLokiLogs: tool({
          description:
            "Fetch application logs from Loki for a service during a time range. Use this to investigate errors, exceptions, timeouts, failed requests, dependency failures, and other application events. Generate an appropriate LogQL query. The LogQL is simulated and is not validated or executed against a real Loki server.",

          inputSchema: z.object({
            service: z
              .string()
              .describe("Service name, for example checkout"),

            logql: z
              .string()
              .describe(
                'LogQL query generated for the investigation, for example {service="checkout"} |= "ERROR"'
              ),

            start: z
              .string()
              .describe(
                "Start of the time range, for example 14:00"
              ),

            end: z
              .string()
              .describe(
                "End of the time range, for example 14:30"
              )
          }),

          execute: async ({
            service,
            logql,
            start,
            end
          }) => {
            const startMinute = start.slice(0, 5);
            const endMinute = end.slice(0, 5);

            await this.ensureIncidentDataSeed();

            const db = this.env.incident_db;
            if (db) {
              const rows = await db
                .prepare(
                  `
                    SELECT service, timestamp, level, message
                    FROM loki_logs
                    WHERE service = ?
                      AND substr(timestamp, 1, 5) >= ?
                      AND substr(timestamp, 1, 5) <= ?
                    ORDER BY timestamp ASC
                  `
                )
                .bind(service, startMinute, endMinute)
                .all<{ service: string; timestamp: string; level: string; message: string }>();

              if (rows.results.length > 0) {
                return {
                  service,
                  query: logql,
                  start,
                  end,
                  logs: rows.results.map((row) => ({
                    timestamp: row.timestamp,
                    level: row.level,
                    message: row.message,
                    service: row.service
                  }))
                };
              }
            }

            const bucket = this.env.incident_bucket;
            if (bucket) {
              const object = await bucket.get(`incident-data/${service.toLowerCase()}-loki.json`);
              if (object) {
                const payload = (await object.json()) as { logs?: Array<{ timestamp: string; level: string; message: string; service: string }> };
                if (payload.logs?.length) {
                  return {
                    service,
                    query: logql,
                    start,
                    end,
                    logs: payload.logs.filter((entry) => {
                      const minute = entry.timestamp.slice(0, 5);
                      return minute >= startMinute && minute <= endMinute;
                    })
                  };
                }
              }
            }

            return {
              service,
              query: logql,
              start,
              end,
              logs: [
                {
                  timestamp: "14:02:51",
                  level: "INFO",
                  message: "Deployment checkout-v42 completed",
                  service
                },
                {
                  timestamp: "14:03:12",
                  level: "ERROR",
                  message: "Connection pool exhausted",
                  service
                },
                {
                  timestamp: "14:03:45",
                  level: "ERROR",
                  message: "Failed to acquire database connection",
                  service
                },
                {
                  timestamp: "14:04:02",
                  level: "ERROR",
                  message: "Request timeout while calling payment-service",
                  service
                },
                {
                  timestamp: "14:04:31",
                  level: "ERROR",
                  message: "Request timeout while calling payment-service",
                  service
                },
                {
                  timestamp: "14:05:17",
                  level: "ERROR",
                  message: "Request timeout while calling payment-service",
                  service
                },
                {
                  timestamp: "14:05:42",
                  level: "ERROR",
                  message: "Request timeout while calling payment-service",
                  service
                }
              ]
            };
          }
        }),

        // ------------------------------------------------------------
        // AWS Scaling Events
        // ------------------------------------------------------------
        getAwsScalingEvents: tool({
          description:
            "Get AWS autoscaling events for a service during a time range. Use this when investigating whether changes in instance or task capacity could explain an incident. Returns simulated AWS scaling events.",

          inputSchema: z.object({
            service: z
              .string()
              .describe("Service name, for example checkout"),

            start: z
              .string()
              .describe(
                "Start of the time range, for example 14:00"
              ),

            end: z
              .string()
              .describe(
                "End of the time range, for example 14:30"
              )
          }),

          execute: async ({
            service,
            start,
            end
          }) => {
            const startMinute = start.slice(0, 5);
            const endMinute = end.slice(0, 5);

            await this.ensureIncidentDataSeed();

            const db = this.env.incident_db;
            if (db) {
              const rows = await db
                .prepare(
                  `
                    SELECT service, timestamp, type, previousCapacity, newCapacity, capacity, reason
                    FROM scaling_events
                    WHERE service = ?
                      AND substr(timestamp, 1, 5) >= ?
                      AND substr(timestamp, 1, 5) <= ?
                    ORDER BY timestamp ASC
                  `
                )
                .bind(service, startMinute, endMinute)
                .all<{
                  service: string;
                  timestamp: string;
                  type: string;
                  previousCapacity: number | null;
                  newCapacity: number | null;
                  capacity: number | null;
                  reason: string;
                }>();

              if (rows.results.length > 0) {
                return {
                  service,
                  start,
                  end,
                  events: rows.results.map((row) => ({
                    timestamp: row.timestamp,
                    type: row.type,
                    previousCapacity: row.previousCapacity,
                    newCapacity: row.newCapacity,
                    capacity: row.capacity,
                    reason: row.reason
                  }))
                };
              }
            }

            const bucket = this.env.incident_bucket;
            if (bucket) {
              const object = await bucket.get(`incident-data/${service.toLowerCase()}-scaling.json`);
              if (object) {
                const payload = (await object.json()) as {
                  events?: Array<{
                    timestamp: string;
                    type: string;
                    previousCapacity?: number;
                    newCapacity?: number;
                    capacity?: number;
                    reason: string;
                  }>;
                };
                if (payload.events?.length) {
                  return {
                    service,
                    start,
                    end,
                    events: payload.events.filter((entry) => {
                      const minute = entry.timestamp.slice(0, 5);
                      return minute >= startMinute && minute <= endMinute;
                    })
                  };
                }
              }
            }

            return {
              service,
              start,
              end,

              events: [
                {
                  timestamp: "14:01:48",
                  type: "SCALE_OUT",
                  previousCapacity: 4,
                  newCapacity: 8,
                  reason: "CPU utilization exceeded target"
                },
                {
                  timestamp: "14:02:18",
                  type: "TASKS_STABILIZED",
                  capacity: 8,
                  reason: "Desired task count reached"
                },
                {
                  timestamp: "14:07:42",
                  type: "SCALE_OUT",
                  previousCapacity: 8,
                  newCapacity: 12,
                  reason: "Request count exceeded target"
                }
              ]
            };
          }
        }),

        // ------------------------------------------------------------
        // Browser-side timezone tool
        // ------------------------------------------------------------
        getUserTimezone: tool({
          description:
            "Get the user's timezone from their browser. Use this when you need to know the user's local time.",

          inputSchema: z.object({})
        }),

        // ------------------------------------------------------------
        // Scheduling
        // ------------------------------------------------------------
        scheduleTask: tool({
          description:
            "Schedule a task to be executed at a later time. Use this when the user asks to be reminded or wants something done later.",

          inputSchema: scheduleSchema,

          execute: async ({
            when,
            description
          }) => {
            if (when.type === "no-schedule") {
              return "Not a valid schedule input";
            }

            const input =
              when.type === "scheduled"
                ? when.date
                : when.type === "delayed"
                  ? when.delayInSeconds
                  : when.type === "cron"
                    ? when.cron
                    : null;

            if (!input) {
              return "Invalid schedule type";
            }

            try {
              this.schedule(
                input,
                "executeTask",
                description,
                {
                  idempotent: true
                }
              );

              return `Task scheduled: "${description}" (${when.type}: ${input})`;
            } catch (error) {
              return `Error scheduling task: ${error}`;
            }
          }
        }),

        getScheduledTasks: tool({
          description:
            "List all tasks that have been scheduled",

          inputSchema: z.object({}),

          execute: async () => {
            const tasks = this.getSchedules();

            return tasks.length > 0
              ? tasks
              : "No scheduled tasks found.";
          }
        }),

        cancelScheduledTask: tool({
          description:
            "Cancel a scheduled task by its ID",

          inputSchema: z.object({
            taskId: z
              .string()
              .describe("The ID of the task to cancel")
          }),

          execute: async ({ taskId }) => {
            try {
              this.cancelSchedule(taskId);

              return `Task ${taskId} cancelled.`;
            } catch (error) {
              return `Error cancelling task: ${error}`;
            }
          }
        })
      },

      stopWhen: stepCountIs(20),
      abortSignal: options?.abortSignal
    });

    return result.toUIMessageStreamResponse();
  }

  async executeTask(
    description: string,
    _task: Schedule<string>
  ) {
    console.log(
      `Executing scheduled task: ${description}`
    );

    this.broadcast(
      JSON.stringify({
        type: "scheduled-task",
        description,
        timestamp: new Date().toISOString()
      })
    );
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