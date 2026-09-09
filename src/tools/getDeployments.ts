import { tool } from "ai";
import { z } from "zod";
import { getUtcTimeRange } from "./time";
import { assertKnownService, type ToolAgent } from "./service";

export function createGetDeploymentsTool(agent: ToolAgent) {
  return tool({
    description:
      "Get deployment events for a service during a time range. Use this to determine whether a deployment or version change happened before or during an incident.",

    inputSchema: z.object({
      service: z.string().describe("Service name, for example search"),

      start: z
        .string()
        .describe("Start date-time, for example 2026-09-08 14:09"),

      end: z
        .string()
        .describe("End UTC date-time, for example 2026-09-09 14:09")
    }),

    execute: async ({ service, start, end }) => {
      assertKnownService(service, agent.services);
      const { startUtc, endUtc } = getUtcTimeRange(start, end);

      const rawQuery = `
        SELECT service, timestamp, version, environment, status
        FROM deployments
        WHERE service = '${service}'
          AND date || ' ' || timestamp >= '${startUtc}'
          AND date || ' ' || timestamp <= '${endUtc}'
        ORDER BY timestamp ASC
      `;

      console.log("getDeployments debug", {
        service,
        start,
        end,
        startUtc,
        endUtc,
        rawQuery
      });

      let rows;
      try {
        rows = await agent.env.incident_db
          .prepare(
            `
              SELECT service, timestamp, version, environment, status
              FROM deployments
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
            version: string;
            environment: string;
            status: string;
          }>();
      } catch (error) {
        console.error("getDeployments D1 error", {
          service,
          start,
          end,
          startUtc,
          endUtc,
          error
        });
        throw error;
      }

      console.log("getDeployments rows", rows);

      return {
        service,
        start,
        end,
        deployments: rows.results.map((row) => ({
          timestamp: row.timestamp,
          version: row.version,
          environment: row.environment,
          status: row.status
        }))
      };
    }
  });
}
