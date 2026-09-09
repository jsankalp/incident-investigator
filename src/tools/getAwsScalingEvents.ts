import { tool } from "ai";
import { z } from "zod";

type ToolAgent = { readonly env: Env };

export function createGetAwsScalingEventsTool(agent: ToolAgent) {
  return tool({
    description:
      "Get AWS autoscaling events for a service during a time range. Use this when investigating whether changes in instance or task capacity could explain an incident. Returns simulated AWS scaling events.",

    inputSchema: z.object({
      service: z.string().describe("Service name, for example checkout"),

      start: z.string().describe("Start of the time range, for example 14:00"),

      end: z.string().describe("End of the time range, for example 14:30")
    }),

    execute: async ({ service, start, end }) => {
      const startMinute = start.slice(0, 5);
      const endMinute = end.slice(0, 5);

      const db = agent.env.incident_db;
      if (db) {
        const query = `
          SELECT service, timestamp, type, previousCapacity, newCapacity, capacity, reason
          FROM scaling_events
          WHERE service = '${service}'
            AND substr(timestamp, 1, 5) >= '${startMinute}'
            AND substr(timestamp, 1, 5) <= '${endMinute}'
          ORDER BY timestamp ASC
        `;

        console.log("getAwsScalingEvents debug", {
          service,
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
            startMinute,
            endMinute,
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
