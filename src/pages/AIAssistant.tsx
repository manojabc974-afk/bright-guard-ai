import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Shield, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  "How do I protect against phishing?",
  "What is a zero-day attack?",
  "Explain federated learning",
  "Best security practices for mobile",
];

const mockResponses: Record<string, string> = {
  "phishing": "## 🛡️ Phishing Protection Tips\n\n1. **Never click suspicious links** — Always verify the sender\n2. **Check URL carefully** — Look for misspellings in domain names\n3. **Enable 2FA** — Use biometric or OTP-based authentication\n4. **Use our AI scanner** — Scan any URL before opening\n5. **Watch for urgency** — Phishing often creates false urgency\n\n> Our BERT model detects phishing with **97.3% accuracy**",
  "zero-day": "## ⚠️ Zero-Day Attacks\n\nA **zero-day attack** exploits an unknown vulnerability before developers can fix it.\n\n### How AEGIS Detects Them:\n- **Behavioral Analysis** — Monitors app actions against baseline\n- **Anomaly Detection** — Statistical deviation triggers alerts\n- **Heuristic Engine** — Pattern matching against attack signatures\n\nOur system achieves **88.6% detection rate** on unknown threats.",
  "federated": "## 🌐 Federated Learning\n\n**Privacy-preserving AI** that trains models across devices without sharing raw data.\n\n### How It Works:\n1. Local model trains on your device\n2. Only model weights are shared (not your data)\n3. Global model improves from all participants\n4. Updated model is sent back to your device\n\n### AEGIS Network:\n- **156 active nodes** contributing\n- **91.2% accuracy** and improving\n- **Zero data leakage** — your data never leaves your device",
  "default": "## 🤖 Security Advisor\n\nI can help you with:\n- **Threat analysis** and explanation\n- **Security best practices**\n- **Understanding our AI models**\n- **Configuring protection settings**\n\nAsk me anything about mobile security!",
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "# 👋 Hello! I'm AEGIS AI Assistant\n\nI'm here to guide you through mobile security. Ask me about threats, protection strategies, or how our AI models work." },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1500));

    const lower = msg.toLowerCase();
    let response = mockResponses.default;
    if (lower.includes("phishing")) response = mockResponses.phishing;
    else if (lower.includes("zero-day") || lower.includes("zero day")) response = mockResponses["zero-day"];
    else if (lower.includes("federated")) response = mockResponses.federated;

    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-xl font-display font-bold tracking-wider">AI SECURITY ASSISTANT</h1>
        <p className="text-sm text-muted-foreground mt-1">Personal AI guidance powered by deep learning</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="rounded-lg bg-primary/10 p-2 h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl p-4 ${
                msg.role === "user"
                  ? "bg-primary/10 border border-primary/20"
                  : "glass"
              }`}>
                <div className="prose prose-invert prose-sm max-w-none text-sm [&_h1]:font-display [&_h2]:font-display [&_h3]:font-display [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-foreground/80 [&_li]:text-foreground/80 [&_strong]:text-foreground [&_blockquote]:border-primary/30 [&_blockquote]:text-muted-foreground">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="rounded-lg bg-accent/10 p-2 h-fit">
                  <User className="h-4 w-4 text-accent" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="rounded-lg bg-primary/10 p-2 h-fit">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="glass rounded-xl p-4 flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Analyzing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 py-3">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="text-xs bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 transition-colors border border-border"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3 pt-3 border-t border-border">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about security..."
          className="bg-secondary border-border"
          disabled={isTyping}
        />
        <Button
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
