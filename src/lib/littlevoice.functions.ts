import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { LVVoice } from "./littlevoice.server";

const voicesInput = z.object({ language: z.enum(["bn", "en", "hi"]) });
const ttsInput = z.object({
  text: z.string().min(1).max(2500),
  voice_id: z.string().min(3),
  language: z.enum(["bn", "en", "hi"]),
  auto_emotion: z.boolean().default(true),
});

export const getVoices = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => voicesInput.parse(d))
  .handler(async ({ data }): Promise<{ voices: LVVoice[] }> => {
    const { listVoicesForLanguage } = await import("./littlevoice.server");
    return { voices: await listVoicesForLanguage(data.language) };
  });

export const generateSpeech = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ttsInput.parse(d))
  .handler(async ({ data }) => {
    const { synthesize } = await import("./littlevoice.server");
    return synthesize({ ...data, emotion_override: null });
  });

export const detectEmotion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ text: z.string().min(1).max(5000) }).parse(d))
  .handler(async ({ data }) => {
    const { analyzeEmotion } = await import("./emotion");
    return analyzeEmotion(data.text);
  });
