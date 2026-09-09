import { tool } from "ai";
import { z } from "zod";

type ToolAgent = { readonly env: Env };

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

      start: z.string().describe("Start of the time range, for example 14:00"),

      end: z.string().describe("End of the time range, for example 14:30")
    }),

    execute: async ({ service, promql, start, end }) => {
      const startMinute = start.slice(0, 5);
      const endMinute = end.slice(0, 5);

      const db = agent.env.incident_db;
      if (db) {
        const query = `
          SELECT service, timestamp, metric, value, unit
          FROM prom_metrics
          WHERE service = '${service}'
            AND substr(timestamp, 1, 5) >= '${startMinute}'
            AND substr(timestamp, 1, 5) <= '${endMinute}'
          ORDER BY timestamp ASC
        `;

        console.log("queryPrometheus debug", {
          service,
          promql,
          start,
          end,
          startMinute,
          endMinute,
          rawQuery: query
        });

        try {
          const rows = await db
            .prepare(
              `
                SELECT service, timestamp, metric, value, unit
                FROM prom_metrics
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
            startMinute,
            endMinute,
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
