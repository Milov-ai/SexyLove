import { useState, useRef, useEffect } from "react";
import { useEphemeralChat } from "@/hooks/useEphemeralChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Ghost } from "lucide-react";
import { useVaultStore } from "@/store/vault.store";
import { GlassCard } from "@/components/ui/premium/GlassCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";

const EphemeralChat = () => {
  const { user } = useVaultStore();
  const { messages, sendMessage } = useEphemeralChat(
    user?.username || "Anonymous",
  );
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <GlassCard
      variant="dark"
      className="w-full border-white/5 shadow-2xl overflow-hidden backdrop-blur-xl"
    >
      <CardHeader className="pb-3 pt-4 px-4 border-b border-white/5 bg-black/20">
        <CardTitle className="text-xs font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
          <Ghost className="w-3 h-3 text-neon-primary animate-pulse" />
          <span>Whisper Mode</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-transparent">
        <div
          ref={scrollRef}
          className="h-40 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-none mask-gradient-b"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: msg.isMe ? 20 : -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium backdrop-blur-md shadow-sm border ${
                    msg.isMe
                      ? "bg-neon-primary/80 border-neon-primary/30 text-white rounded-tr-sm"
                      : "bg-white/10 border-white/5 text-foreground rounded-tl-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-white/20 text-xs tracking-wider uppercase">
              <span className="animate-pulse">Silence is Sacred</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 items-center bg-white/5 p-1 rounded-full border border-white/5 pl-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a secret..."
            className="bg-transparent border-none text-sm text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
          />
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-gradient-to-tr from-neon-primary to-neon-secondary hover:from-neon-primary hover:to-neon-primary rounded-full h-8 w-8 shadow-neon"
          >
            <Send className="w-3 h-3 text-white" />
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
};

export default EphemeralChat;
