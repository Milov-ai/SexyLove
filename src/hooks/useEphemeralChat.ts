import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  isMe: boolean;
}

export const useEphemeralChat = (username: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);

    // Schedule removal
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }, 10000); // 10 seconds
  }, []);

  useEffect(() => {
    // Unique channel for the couple
    const channel = supabase.channel("ephemeral-chat", {
      config: {
        broadcast: { self: false }, // We handle local echo manually
      },
    });

    channel
      .on("broadcast", { event: "message" }, (payload) => {
        const newMessage: ChatMessage = {
          ...payload.payload,
          isMe: false,
        };
        addMessage(newMessage);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addMessage]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const message: ChatMessage = {
      id: uuidv4(),
      text,
      sender: username,
      timestamp: Date.now(),
      isMe: true,
    };

    // Local echo
    addMessage(message);

    // Broadcast
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "message",
        payload: {
          id: message.id,
          text: message.text,
          sender: message.sender,
          timestamp: message.timestamp,
        },
      });
    }
  };

  return { messages, sendMessage };
};
