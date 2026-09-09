import { tool } from "ai";
import { z } from "zod";

export const getUserTimezoneTool = tool({
  description:
    "Get the user's timezone from their browser. Use this when you need to know the user's local time.",

  inputSchema: z.object({})
});
