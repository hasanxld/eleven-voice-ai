import { createFileRoute } from "@tanstack/react-router";
import { listVoicesForLanguage, LANGUAGES, type LangCode } from "@/lib/littlevoice.server";

const cors = { "access-control-allow-origin": "*" };

export const Route = createFileRoute("/api/public/v1/voices")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const lang = (url.searchParams.get("language") ?? "en") as LangCode;
          if (!LANGUAGES.some((l) => l.code === lang)) {
            return Response.json(
              { success: false, error: "language must be bn, en or hi" },
              { status: 400, headers: cors },
            );
          }
          const voices = await listVoicesForLanguage(lang);
          return Response.json({ success: true, language: lang, count: voices.length, voices }, { headers: cors });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("little-voice voices error:", message);
          return Response.json({ success: false, error: message }, { status: 500, headers: cors });
        }
      },
    },
  },
});
