import { tool } from "ai";
import { z } from "zod";
import { getUtcTimeRange } from "./time";
import { assertKnownService, type ToolAgent } from "./service";

export function createGetAwsScalingEventsTool(agent: ToolAgent) {
  return tool({
    description:
      "Get AWS autoscaling events for a service during a time range. Use this when investigating whether changes in instance or task capacity could explain an incident. Returns simulated AWS scaling events.",

    inputSchema: z.object({
      service: z.string().describe("Service name, for example checkout"),

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

      const db = agent.env.incident_db;
      if (db) {
        const query = `
          SELECT service, timestamp, type, previousCapacity, newCapacity, capacity, reason
          FROM scaling_events
          WHERE service = '${service}'
            AND date || ' ' || timestamp >= '${startUtc}'
            AND date || ' ' || timestamp <= '${endUtc}'
          ORDER BY timestamp ASC
        `;

        console.log("getAwsScalingEvents debug", {
          service,
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
                SELECT service, timestamp, type, previousCapacity, newCapacity, capacity, reason
                FROM scaling_events
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
              type: string;
              previousCapacity: number | null;
              newCapacity: number | null;
              capacity: number | null;
              reason: string;
            }>();

          console.log("getAwsScalingEvents rows", rows);

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
        } catch (error) {
          console.error("getAwsScalingEvents D1 error", {
            service,
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
        start,
        end,
        events: []
      };
    }
  });
}
