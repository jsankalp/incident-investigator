import { tool } from "ai";
import { z } from "zod";

type ToolAgent = { readonly env: Env };

export function createFetchLokiLogsTool(agent: ToolAgent) {
  return tool({
    description:
      "Fetch application logs from Loki for a service during a time range. Use this to investigate errors, exceptions, timeouts, failed requests, dependency failures, and other application events. Generate an appropriate LogQL query. The LogQL is simulated and is not validated or executed against a real Loki server.",

    inputSchema: z.object({
      service: z.string().describe("Service name, for example checkout"),

      logql: z
        .string()
        .describe(
          'LogQL query generated for the investigation, for example {service="checkout"} |= "ERROR"'
        ),

      start: z.string().describe("Start of the time range, for example 14:00"),

      end: z.string().describe("End of the time range, for example 14:30")
    }),

    execute: async ({ service, logql, start, end }) => {
      const startMinute = start.slice(0, 5);
      const endMinute = end.slice(0, 5);

      const db = agent.env.incident_db;
      if (db) {
        const query = `
          SELECT service, timestamp, level, message
          FROM loki_logs
          WHERE service = '${service}'
            AND substr(timestamp, 1, 5) >= '${startMinute}'
            AND substr(timestamp, 1, 5) <= '${endMinute}'
          ORDER BY timestamp ASC
        `;

        console.log("fetchLokiLogs debug", {
          service,
          logql,
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
                SELECT service, timestamp, level, message
                FROM loki_logs
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
              level: string;
              message: string;
            }>();

          console.log("fetchLokiLogs rows", rows);

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
        } catch (error) {
          console.error("fetchLokiLogs D1 error", {
            service,
            logql,
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
        query: logql,
        start,
        end,
        logs: []
      };
    }
  });
}
