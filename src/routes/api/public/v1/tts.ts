import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { synthesize } from "@/lib/littlevoice.server";

const schema = z.object({
  text: z.string().min(1).max(2500),
  voice_id: z.string().min(3),
  language: z.enum(["bn", "en", "hi"]).default("en"),
  auto_emotion: z.boolean().default(true),
  model_id: z.string().optional(),
  format: z.enum(["json", "audio"]).default("json"),
});

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

export const Route = createFileRoute("/api/public/v1/tts")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = schema.parse(await request.json());
          const result = await synthesize({ ...body, emotion_override: null });

          if (body.format === "audio") {
            const bytes = Buffer.from(result.audio_base64, "base64");
            return new Response(bytes, {
              headers: { ...cors, "content-type": "audio/mpeg" },
            });
          }

          return Response.json(
            {
              success: true,
              audio_base64: result.audio_base64,
              content_type: result.content_type,
              emotion: result.emotion,
              characters: result.characters,
              latency_ms: result.latency_ms,
            },
            { headers: cors },
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("little-voice tts error:", message);
          return Response.json({ success: false, error: message }, { status: 400, headers: cors });
        }
      },
    },
  },
});
