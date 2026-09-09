import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { analyzeEmotion } from "@/lib/emotion";
import { logRequest } from "@/lib/littlevoice.server";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

export const Route = createFileRoute("/api/public/v1/emotion")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        const started = Date.now();
        try {
          const { text } = z.object({ text: z.string().min(1).max(5000) }).parse(await request.json());
          const result = analyzeEmotion(text);
          await logRequest({
            endpoint: "/api/public/v1/emotion",
            status: "success",
            key_label: "local-ai",
            latency_ms: Date.now() - started,
            message: result.emotion,
            chars: text.length,
          });
          return Response.json({ success: true, ...result }, { headers: cors });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          await logRequest({
            endpoint: "/api/public/v1/emotion",
            status: "failed",
            key_label: "local-ai",
            latency_ms: Date.now() - started,
            message: message.slice(0, 300),
          });
          return Response.json({ success: false, error: message }, { status: 400, headers: cors });
        }
      },
    },
  },
});
