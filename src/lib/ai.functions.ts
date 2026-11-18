import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ToolResult } from "./tool-types";

const text = (min: number, max: number) => z.string().trim().min(min).max(max);

const inputSchema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("email"),
    audience: z.enum(["Client", "Manager", "Team"]),
    tone: z.enum(["Formal", "Friendly", "Persuasive"]),
    purpose: text(3, 1000),
    keyPoints: z.string().max(4000),
  }),
  z.object({ tool: z.literal("meeting"), notes: text(20, 20000) }),
  z.object({
    tool: z.literal("planner"),
    tasks: text(3, 6000),
    deadlines: z.string().max(3000),
    hours: z.string().max(300),
  }),
  z.object({ tool: z.literal("research"), content: text(3, 30000) }),
]);

export const runTool = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<ToolResult> => {
    const { generateResponse, GatewayError, RateLimitError, PaymentRequiredError } =
      await import("@lovable.dev/ai-gateway");
    const { MODEL, SPECS, SCHEMAS, buildSystemPrompt, buildUserMessage } =
      await import("./ai-prompts.server");

    try {
      const res = await generateResponse({
        model: MODEL,
        instructions: buildSystemPrompt(SPECS[data.tool]),
        input: [{ role: "user", content: buildUserMessage(data) }],
        reasoning: { effort: "low" },
        text: {
          format: {
            type: "json_schema",
            name: `${data.tool}_output`,
            schema: SCHEMAS[data.tool] as unknown as Record<string, unknown>,
            strict: true,
          },
        },
      });

      let raw = "";
      for (const item of res.output ?? []) {
        if (item.type !== "message") continue;
        for (const part of item.content) {
          if (part.type === "output_text") raw += part.text;
          if (part.type === "refusal")
            return { ok: false, error: "The AI declined this request. Try rephrasing it." };
        }
      }
      if (!raw) return { ok: false, error: "The AI returned an empty answer. Please try again." };

      const parsed = JSON.parse(raw);
      return { ok: true, tool: data.tool, data: parsed } as ToolResult;
    } catch (err) {
      console.error("runTool failed", err);
      if (err instanceof RateLimitError)
        return {
          ok: false,
          error: "Too many requests right now. Please wait a moment and try again.",
        };
      if (err instanceof PaymentRequiredError)
        return {
          ok: false,
          error: "AI credits have run out for this workspace. Add credits to continue.",
        };
      if (err instanceof GatewayError)
        return {
          ok: false,
          error: "The AI service couldn't complete this request. Please try again.",
        };
      return { ok: false, error: "Something went wrong generating your result. Please try again." };
    }
  });
