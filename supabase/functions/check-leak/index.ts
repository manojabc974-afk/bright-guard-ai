// Edge function: check-leak
// Checks if an email or password appears in known data breaches.
// - Email: XposedOrNot public API (free, no key)
// - Password: HaveIBeenPwned Pwned Passwords (k-anonymity — only first 5 chars
//   of SHA-1 are sent; the password itself never leaves this function)

import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface Body {
  type: "email" | "password";
  value: string;
}

async function sha1Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-1", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

async function checkEmail(email: string) {
  const url = `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`;
  const res = await fetch(url, { headers: { "User-Agent": "SentinelAI" } });
  if (res.status === 404) return { found: false, breaches: [] };
  if (!res.ok) throw new Error(`XposedOrNot error ${res.status}`);
  const data = await res.json();
  // Response shape: { breaches: [["BreachA","BreachB"]] }  OR  { Error: "Not found" }
  const list: string[] = Array.isArray(data?.breaches?.[0]) ? data.breaches[0] : [];
  return { found: list.length > 0, breaches: list };
}

async function checkPassword(password: string) {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true", "User-Agent": "SentinelAI" },
  });
  if (!res.ok) throw new Error(`PwnedPasswords error ${res.status}`);
  const text = await res.text();
  const match = text
    .split("\n")
    .map((l) => l.trim().split(":"))
    .find(([s]) => s.toUpperCase() === suffix);
  const count = match ? parseInt(match[1], 10) : 0;
  return {
    found: count > 0,
    breaches: count > 0 ? [`Seen in ${count.toLocaleString()} known breaches`] : [],
    breach_count: count,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    if (!body?.type || !body?.value || typeof body.value !== "string") {
      return new Response(JSON.stringify({ error: "Missing type or value" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.value.length > 256) {
      return new Response(JSON.stringify({ error: "Value too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result;
    if (body.type === "email") {
      const email = body.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return new Response(JSON.stringify({ error: "Invalid email" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const r = await checkEmail(email);
      result = { ...r, breach_count: r.breaches.length };
    } else if (body.type === "password") {
      result = await checkPassword(body.value);
    } else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("check-leak error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
