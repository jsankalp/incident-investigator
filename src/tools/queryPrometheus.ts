import { tool } from "ai";
import { z } from "zod";
import { getUtcTimeRange } from "./time";
import { assertKnownService, type ToolAgent } from "./service";

export function createQueryPrometheusTool(agent: ToolAgent) {
  return tool({
    description:
      "Query Prometheus metrics for a service during a time range. Use this to investigate latency, error rate, throughput, CPU, memory, request volume, or other service health metrics. Generate an appropriate PromQL query. The PromQL is simulated and is not validated or executed against a real Prometheus server.",

    inputSchema: z.object({
      service: z.string().describe("Service name, for example checkout"),

      promql: z
        .string()
        .describe(
          'PromQL query generated for the investigation, for example rate(http_requests_total{service="checkout"}[5m])'
        ),

      start: z
        .string()
        .describe("Start date-time, for example 2026-09-08 14:09"),

      end: z
        .string()
        .describe("End UTC date-time, for example 2026-09-09 14:09")
    }),

    execute: async ({ service, promql, start, end }) => {
      assertKnownService(service, agent.services);
      const { startUtc, endUtc } = getUtcTimeRange(start, end);

      const db = agent.env.incident_db;
      if (db) {
        const query = `
          SELECT service, timestamp, metric, value, unit
          FROM prom_metrics
          WHERE service = '${service}'
            AND date || ' ' || timestamp >= '${startUtc}'
            AND date || ' ' || timestamp <= '${endUtc}'
          ORDER BY timestamp ASC
        `;

        console.log("queryPrometheus debug", {
          service,
          promql,
          start,
          end,
          startUtc,
          endUtc,
          rawQuery: query
        });

        try {
          const rows = await db
            .prepare(
              `
                SELECT service, timestamp, metric, value, unit
                FROM prom_metrics
                WHERE service = ?
                  AND date || ' ' || timestamp >= ?
                  AND date || ' ' || timestamp <= ?
                ORDER BY timestamp ASC
              `
            )
            .bind(service, startUtc, endUtc)
            .all<{
              service: string;
              timestamp: string;
              metric: string;
              value: number;
              unit: string;
            }>();

          console.log("queryPrometheus rows", rows);

          if (rows.results.length > 0) {
            return {
              service,
              query: promql,
              start,
              end,
              metric:
                rows.results[0]?.metric ?? "http_request_duration_seconds",
              aggregation: "p95",
              unit: rows.results[0]?.unit ?? "ms",
              data: rows.results.map((row) => ({
                timestamp: row.timestamp,
                value: row.value
              }))
            };
          }
        } catch (error) {
          console.error("queryPrometheus D1 error", {
            service,
            promql,
            start,
            end,
            startUtc,
            endUtc,
            error
          });
          throw error;
        }
      }

      return {
        service,
        query: promql,
        start,
        end,
        metric: "http_request_duration_seconds",
        aggregation: "p95",
        unit: "ms",
        data: []
      };
    }
  });
}
