import { tool } from "ai";
import { z } from "zod";
import { getUtcTimeRange } from "./time";
import { assertKnownService, type ToolAgent } from "./service";

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

      start: z
        .string()
        .describe("Start date-time, for example 2026-09-08 14:09"),

      end: z
        .string()
        .describe("End UTC date-time, for example 2026-09-09 14:09")
    }),

    execute: async ({ service, logql, start, end }) => {
      assertKnownService(service, agent.services);
      const { startUtc, endUtc } = getUtcTimeRange(start, end);

      const db = agent.env.incident_db;
      if (db) {
        const query = `
          SELECT service, timestamp, level, message
          FROM loki_logs
          WHERE service = '${service}'
            AND date || ' ' || timestamp >= '${startUtc}'
            AND date || ' ' || timestamp <= '${endUtc}'
          ORDER BY timestamp ASC
        `;

        console.log("fetchLokiLogs debug", {
          service,
          logql,
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
                SELECT service, timestamp, level, message
                FROM loki_logs
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
            startUtc,
            endUtc,
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
