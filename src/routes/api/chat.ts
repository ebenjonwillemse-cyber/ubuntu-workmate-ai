import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { CHAT_ERROR_MARKER } from "@/lib/chat-protocol";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(8000) }))
    .min(1)
    .max(40),
});


export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: z.infer<typeof bodySchema>;
        try {
          body = bodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request", { status: 400 });
        }

        const { streamResponse, RateLimitError, PaymentRequiredError } = await import("@lovable.dev/ai-gateway");
        const { MODEL, CHAT_SPEC, buildSystemPrompt } = await import("@/lib/ai-prompts.server");
        const encoder = new TextEncoder();

        const friendly = (err: unknown) => {
          console.error("chat failed", err);
          if (err instanceof RateLimitError) return "Too many requests right now. Please wait a moment.";
          if (err instanceof PaymentRequiredError) return "AI credits have run out for this workspace.";
          return "The assistant couldn't respond. Please try again.";
        };

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              const events = await streamResponse(
                {
                  model: MODEL,
                  instructions: buildSystemPrompt(CHAT_SPEC),
                  input: body.messages.map((m) => ({ role: m.role, content: m.content })),
                  reasoning: { effort: "low" },
                },
                { signal: request.signal },
              );
              for await (const ev of events) {
                if (ev.type === "response.output_text.delta") controller.enqueue(encoder.encode(ev.delta));
              }
            } catch (err) {
              if (!request.signal.aborted) controller.enqueue(encoder.encode(CHAT_ERROR_MARKER + friendly(err)));
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
