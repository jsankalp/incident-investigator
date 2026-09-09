import { tool } from "ai";
import { z } from "zod";

export const getUserTimezoneTool = tool({
  description:
    "Get the user's browser timezone and the fixed demo local date-time. Always call this before querying time-based observability data; use localDateTime as the end of relative ranges.",

  inputSchema: z.object({})
});
