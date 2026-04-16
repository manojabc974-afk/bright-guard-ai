import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity URL analysis engine. Analyze URLs for phishing indicators.

Return ONLY valid JSON with this exact structure:
{
  "status": "safe" | "suspicious" | "phishing",
  "score": <0-100 risk score>,
  "explanation": "<2-3 sentence analysis>",
  "indicators": ["<indicator 1>", "<indicator 2>", ...]
}

Analysis criteria:
- Check domain reputation patterns (recently registered, misspelled known brands)
- Detect suspicious keywords (login, verify, bank, OTP, secure-, free-, account, password, update)
- Check TLD reputation (.xyz, .tk, .ml, .ga = higher risk)
- Look for URL obfuscation (IP addresses, excessive subdomains, URL shorteners)
- Check for HTTPS vs HTTP
- Detect brand impersonation patterns
- Assess overall URL structure

Be accurate: well-known domains (google.com, github.com, etc.) should score low (safe). Suspicious patterns should score 40-70. Clear phishing patterns should score 70-100.`
          },
          { role: "user", content: `Analyze this URL for phishing: ${url}` }
        ],
        tools: [{
          type: "function",
          function: {
            name: "report_analysis",
            description: "Report the phishing analysis result",
            parameters: {
              type: "object",
              properties: {
                status: { type: "string", enum: ["safe", "suspicious", "phishing"] },
                score: { type: "number", minimum: 0, maximum: 100 },
                explanation: { type: "string" },
                indicators: { type: "array", items: { type: "string" } }
              },
              required: ["status", "score", "explanation", "indicators"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "report_analysis" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-url error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
