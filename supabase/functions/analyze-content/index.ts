import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Extract URLs from text
function extractUrls(text: string): string[] {
  const re = /\b((?:https?:\/\/|www\.)[^\s<>"']+|[a-z0-9-]+\.(?:com|net|org|io|co|in|xyz|tk|ml|ga|cf|ru|info|biz|app|tech|site|online|store|click|link|live|cn)(?:\/[^\s<>"']*)?)/gi;
  const matches = text.match(re) || [];
  return [...new Set(matches.map((u) => u.replace(/[.,;:!?)]+$/, "")))];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { text, imageBase64, mimeType } = body as {
      text?: string;
      imageBase64?: string;
      mimeType?: string;
    };

    if (!text && !imageBase64) {
      return new Response(JSON.stringify({ error: "Provide text or imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build user content (text or vision input)
    const userContent: any[] = [];
    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType || "image/png"};base64,${imageBase64}`,
        },
      });
      userContent.push({
        type: "text",
        text: "Perform OCR on this screenshot and analyze for phishing/scam indicators. Extract any text and URLs you can see.",
      });
    } else {
      userContent.push({
        type: "text",
        text: `Analyze this message for phishing/scam patterns:\n\n${text}`,
      });
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a cybersecurity content analyzer. Examine messages, SMS, WhatsApp texts, screenshots, emails for phishing/scam indicators:
- Urgency manipulation ("act now", "account suspended", "verify immediately")
- Financial bait (lottery wins, refunds, OTP requests, prize claims)
- Brand impersonation (banks, gov, delivery services, telecom)
- Suspicious URLs (shorteners, look-alike domains, raw IPs, unusual TLDs)
- Grammar/spelling red flags typical of scams
- Requests for credentials, OTP, KYC, card numbers

Score 0-30: safe | 31-69: suspicious | 70-100: phishing/scam`,
          },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_content_analysis",
              description: "Return phishing/scam analysis of message or screenshot",
              parameters: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["safe", "suspicious", "phishing"] },
                  score: { type: "number", minimum: 0, maximum: 100 },
                  extracted_text: {
                    type: "string",
                    description: "Text extracted via OCR (empty for plain text input)",
                  },
                  extracted_urls: {
                    type: "array",
                    items: { type: "string" },
                    description: "All URLs found in the content",
                  },
                  indicators: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific scam/phishing red flags identified",
                  },
                  explanation: { type: "string" },
                  recommended_action: { type: "string" },
                },
                required: [
                  "status",
                  "score",
                  "extracted_text",
                  "extracted_urls",
                  "indicators",
                  "explanation",
                  "recommended_action",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_content_analysis" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await aiResp.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");
    const result = JSON.parse(toolCall.function.arguments);

    // Merge URLs found via regex (in case AI missed any)
    const sourceText = (result.extracted_text || text || "").toString();
    const regexUrls = extractUrls(sourceText);
    const merged = [...new Set([...(result.extracted_urls || []), ...regexUrls])];
    result.extracted_urls = merged;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-content error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
