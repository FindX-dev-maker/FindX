const ALLOWED_ORIGIN = "https://findx-dev-maker.github.io";
const MODEL = "gpt-4.1-mini";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const requestCounts = new Map();

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) return json({ error: "Origin not allowed." }, 403, ALLOWED_ORIGIN);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }
    if (request.method !== "POST") return json({ error: "Use POST to chat with Nyxorith." }, 405, ALLOWED_ORIGIN);
    if (!env.OPENAI_API_KEY) return json({ error: "Nyxorith is not configured yet. Add the OPENAI_API_KEY secret to this Worker." }, 503, ALLOWED_ORIGIN);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const now = Date.now();
    const recent = (requestCounts.get(ip) || []).filter(t => now - t < WINDOW_MS);
    if (recent.length >= MAX_REQUESTS) return json({ error: "Too many messages too quickly. Please wait a minute and try again." }, 429, ALLOWED_ORIGIN);
    recent.push(now);
    requestCounts.set(ip, recent);

    let body;
    try { body = await request.json(); } catch { return json({ error: "Please send a valid message." }, 400, ALLOWED_ORIGIN); }
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) return json({ error: "Type a message first." }, 400, ALLOWED_ORIGIN);
    if (message.length > 8000) return json({ error: "That message is too long. Please keep it under 8,000 characters." }, 413, ALLOWED_ORIGIN);

    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    const input = [];
    for (const item of history) {
      if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") continue;
      input.push({ role: item.role, content: item.content.slice(0, 5000) });
    }
    input.push({ role: "user", content: message });

    const instructions = `You are Nyxorith, the intelligent AI assistant built into FindX, an online marketplace.
Help buyers discover products, compare options, understand listings, prepare questions for sellers, shop thoughtfully, and navigate FindX.
Help sellers create compelling listings, write product titles and descriptions, improve pricing and presentation, plan promotions, communicate with customers, and grow their shops.
You are also a capable general-purpose assistant: answer questions on a broad range of topics, explain concepts, brainstorm, write, analyse, and help with technology and coding.
Be friendly, clear, practical, honest, and thoughtful. Ask a concise follow-up when essential details are missing. Never invent FindX policies, listing details, stock, prices, delivery information, order status, or seller contact details. You cannot see a user's account, cart, private orders, or live marketplace database unless the user provides the information in chat; say so clearly. Do not claim to have performed actions on FindX. For purchases, encourage users to verify product details and seller credibility before paying. Distinguish facts from estimates and disclose uncertainty. Respond in the user's language when possible.`;

    try {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ model: MODEL, instructions, input, max_output_tokens: 900 })
      });
      const data = await upstream.json();
      if (!upstream.ok) {
        return json({ error: data.error?.message || "The AI service could not complete that request." }, upstream.status === 429 ? 429 : 502, ALLOWED_ORIGIN);
      }
      const answer = (typeof data.output_text === "string" ? data.output_text : (data.output || []).flatMap(item => item.content || []).filter(part => part.type === "output_text").map(part => part.text || "").join("\n")).trim();
      if (!answer) return json({ error: "Nyxorith did not return a reply. Please try again." }, 502, ALLOWED_ORIGIN);
      return json({ reply: answer }, 200, ALLOWED_ORIGIN);
    } catch {
      return json({ error: "Nyxorith could not reach the AI service. Please try again shortly." }, 502, ALLOWED_ORIGIN);
    }
  }
};