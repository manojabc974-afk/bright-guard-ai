import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function checkSafeBrowsing(url: string): Promise<{ matched: boolean; threats: string[] }> {
  const apiKey = Deno.env.get("GOOGLE_SAFE_BROWSING_API_KEY");
  if (!apiKey) return { matched: false, threats: [] };

  try {
    const resp = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "aegis-security", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        }),
    });
    if (!resp.ok) {
      console.error("Safe Browsing error:", resp.status, await resp.text());
      return { matched: false, threats: [] };
    }
    const data = await resp.json();
    const matches = data.matches || [];
    return {
      matched: matches.length > 0,
      threats: matches.map((m: any) => m.threatType),
    };
  } catch (e) {
    console.error("Safe Browsing exception:", e);
    return { matched: false, threats: [] };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Run Google Safe Browsing + AI in parallel
    const [sbResult, aiResp] = await Promise.all([
      checkSafeBrowsing(url),
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a cybersecurity URL analysis engine using deep learning patterns (BERT/LSTM-style).
Analyze URLs for phishing indicators using these factors:
- Domain reputation, brand impersonation, recently-registered patterns
- Suspicious keywords (login, verify, bank, OTP, secure-, update-account, password)
- TLD risk (.xyz, .tk, .ml, .ga, .cf are high risk)
- URL obfuscation (raw IPs, excessive subdomains, shorteners, punycode)
- HTTPS vs HTTP, suspicious ports
- Lexical features: length, entropy, hyphen count, digit ratio

Score 0-30: safe | 31-69: suspicious | 70-100: phishing
Well-known domains (google.com, github.com, microsoft.com, etc.) → very low score.`
            },
            { role: "user", content: `Analyze this URL: ${url}` }
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
      }),
    ]);

    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again shortly" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI analysis failed");
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");
    const result = JSON.parse(toolCall.function.arguments);

    // Boost result if Google Safe Browsing flagged it
    if (sbResult.matched) {
      result.status = "phishing";
      result.score = Math.max(result.score, 95);
      result.indicators = [
        `🛡️ Google Safe Browsing flagged: ${sbResult.threats.join(", ")}`,
        ...result.indicators,
      ];
      result.explanation = `⚠️ Confirmed by Google Safe Browsing. ${result.explanation}`;
    } else {
      result.indicators = [...result.indicators, "✓ Not in Google Safe Browsing threat list"];
    }

    result.sources = {
      google_safe_browsing: sbResult.matched ? "matched" : "clean",
      ai_model: "gemini-3-flash-preview (BERT-style)",
    };

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
