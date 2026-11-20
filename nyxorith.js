(() => {
  const WORKER_URL = "https://nyxorith-ai.carnagebloodstrike.workers.dev/";
  const style = document.createElement("style");
  style.textContent = `
    .nyx-launcher{position:fixed;right:22px;bottom:22px;z-index:80;border:0;border-radius:999px;padding:13px 19px;background:#171c2b;color:#fff;font-weight:800;box-shadow:0 12px 35px #0003;display:flex;align-items:center;gap:10px;cursor:pointer}
    .nyx-orb{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#3184f6,#8b5cf6);font-size:15px}
    .nyx-panel{position:fixed;right:22px;bottom:86px;z-index:80;width:min(390px,calc(100vw - 28px));height:min(590px,calc(100dvh - 120px));background:var(--surface,#fff);color:var(--text,#172033);border:1px solid var(--line,#e4e8f0);border-radius:20px;box-shadow:0 22px 70px #0003;display:none;flex-direction:column;overflow:hidden}
    .nyx-panel.open{display:flex}.nyx-head{padding:15px 16px;background:#171c2b;color:#fff;display:flex;align-items:center;gap:11px}
    .nyx-head-copy{flex:1}.nyx-head-copy strong{display:block;font-size:14px}.nyx-head-copy small{display:block;color:#b9c3d9;font-size:10px;margin-top:3px}
    .nyx-close{border:0;background:#ffffff18;color:white;border-radius:9px;width:32px;height:32px;font-size:20px;cursor:pointer}
    .nyx-intro{padding:14px 15px 8px;font-size:12px;line-height:1.6;color:var(--muted,#737d91)}
    .nyx-suggestions{display:flex;gap:7px;flex-wrap:wrap;padding:0 14px 10px}
    .nyx-suggestions button{border:1px solid var(--line,#e4e8f0);border-radius:99px;background:var(--surface-2,#eef1f7);color:var(--text,#172033);padding:7px 10px;font-size:10px;cursor:pointer}
    .nyx-messages{flex:1;overflow:auto;padding:10px 13px;display:flex;flex-direction:column;gap:10px}
    .nyx-msg{max-width:88%;padding:10px 12px;border-radius:14px;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
    .nyx-msg.assistant{align-self:flex-start;background:var(--surface-2,#eef1f7);border-bottom-left-radius:4px}
    .nyx-msg.user{align-self:flex-end;background:#3184f6;color:#fff;border-bottom-right-radius:4px}
    .nyx-msg.error{border:1px solid #e9a1a1}
    .nyx-compose{padding:11px;border-top:1px solid var(--line,#e4e8f0);display:flex;gap:8px}
    .nyx-compose textarea{flex:1;resize:none;min-height:42px;max-height:100px;border:1px solid var(--line,#e4e8f0);border-radius:11px;padding:10px;background:var(--bg,#f5f7fb);color:var(--text,#172033);font:inherit;font-size:12px;outline:none}
    .nyx-send{border:0;border-radius:11px;background:#3184f6;color:#fff;padding:0 14px;font-weight:800;cursor:pointer}
    .nyx-send:disabled{opacity:.55;cursor:wait}.nyx-foot{padding:0 13px 10px;font-size:9px;color:var(--muted,#737d91)}
    @media(max-width:520px){.nyx-launcher{right:14px;bottom:14px}.nyx-panel{right:10px;bottom:75px;width:calc(100vw - 20px);height:min(620px,calc(100dvh - 95px))}}
  `;
  document.head.appendChild(style);
  const panel = document.createElement("section");
  panel.className = "nyx-panel";
  panel.setAttribute("aria-label", "Nyxorith AI assistant");
  panel.innerHTML = `
    <div class="nyx-head"><span class="nyx-orb">✦</span><div class="nyx-head-copy"><strong>Nyxorith</strong><small>FindX AI assistant · Buyers, sellers & beyond</small></div><button class="nyx-close" type="button" aria-label="Close assistant">×</button></div>
    <div class="nyx-intro">Ask me about shopping, selling, writing listings, business, technology, learning, or almost anything else.</div>
    <div class="nyx-suggestions"><button type="button">Help me find a product</button><button type="button">Write a product listing</button><button type="button">Give me business advice</button></div>
    <div class="nyx-messages" aria-live="polite"><div class="nyx-msg assistant">Hello! I'm Nyxorith. What can I help you with today?</div></div>
    <form class="nyx-compose"><textarea maxlength="8000" rows="1" placeholder="Message Nyxorith…" aria-label="Message Nyxorith"></textarea><button class="nyx-send" type="submit">Send</button></form>
    <div class="nyx-foot">AI can make mistakes. Verify important information before acting.</div>`;
  const launcher = document.createElement("button");
  launcher.className = "nyx-launcher";
  launcher.type = "button";
  launcher.innerHTML = '<span class="nyx-orb">✦</span><span>Ask Nyxorith</span>';
  document.body.append(launcher, panel);
  const messages = panel.querySelector(".nyx-messages");
  const form = panel.querySelector("form");
  const textarea = panel.querySelector("textarea");
  const send = panel.querySelector(".nyx-send");
  const history = [];
  const addMessage = (role, content, extra="") => {
    const el = document.createElement("div");
    el.className = "nyx-msg " + role + (extra ? " " + extra : "");
    el.textContent = content;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
    return el;
  };
  const open = () => { panel.classList.add("open"); launcher.setAttribute("aria-expanded","true"); textarea.focus(); };
  const close = () => { panel.classList.remove("open"); launcher.setAttribute("aria-expanded","false"); };
  launcher.addEventListener("click", () => panel.classList.contains("open") ? close() : open());
  panel.querySelector(".nyx-close").addEventListener("click", close);
  panel.querySelectorAll(".nyx-suggestions button").forEach(button => button.addEventListener("click", () => { textarea.value = button.textContent; textarea.focus(); }));
  textarea.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); } });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const message = textarea.value.trim();
    if (!message || send.disabled) return;
    addMessage("user", message);
    textarea.value = "";
    send.disabled = true;
    send.textContent = "…";
    const pending = addMessage("assistant", "Thinking…");
    try {
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Nyxorith is temporarily unavailable.");
      pending.textContent = data.reply;
      history.push({ role: "user", content: message }, { role: "assistant", content: data.reply });
      if (history.length > 24) history.splice(0, history.length - 24);
    } catch (error) {
      pending.textContent = error.message || "I couldn't connect. Please try again.";
      pending.classList.add("error");
    } finally {
      send.disabled = false;
      send.textContent = "Send";
      messages.scrollTop = messages.scrollHeight;
      textarea.focus();
    }
  });
})();