import { useState, useRef, useEffect } from "react";
import { useEphemeralChat } from "@/hooks/useEphemeralChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Ghost } from "lucide-react";
import { useVaultStore } from "@/store/vault.store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="w-full bg-slate-900/50 border-slate-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
          <Ghost className="w-4 h-4 text-pink-500" />
          Chat Efímero (10s)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-48 overflow-y-auto space-y-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.5 } }}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.isMe
                      ? "bg-pink-600 text-white rounded-tr-none"
                      : "bg-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs italic">
              <p>Los secretos se desvanecen...</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Susurra algo..."
            className="bg-slate-950 border-slate-800 focus:border-pink-500"
          />
          <Button
            size="icon"
            onClick={handleSend}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EphemeralChat;
