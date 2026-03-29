"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sendMessageAction } from "@/app/coach/messages/actions";

type Message = {
  id: number;
  senderId: number;
  text: string;
  createdAt: Date | null;
};

export default function AthleteMessagesClient({
  conversationId,
  coachName,
  messages,
  athleteId,
}: {
  conversationId: number;
  coachName: string;
  messages: Message[];
  athleteId: number;
}) {
  const router = useRouter();
  const [msgs, setMsgs] = useState(messages);
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  async function handleSend() {
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage("");
    setMsgs((prev) => [
      ...prev,
      { id: Date.now(), senderId: athleteId, text, createdAt: new Date() },
    ]);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("conversationId", String(conversationId));
      formData.set("senderId", String(athleteId));
      formData.set("text", text);
      await sendMessageAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-4 border-b border-neutral-700">
        <h1 className="text-lg font-semibold text-white">{coachName}</h1>
        <p className="text-neutral-400 text-sm">Your coach</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-center text-neutral-500 text-sm py-8">
            Start a conversation with your coach
          </div>
        )}
        {msgs.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.senderId === athleteId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                msg.senderId === athleteId
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-700 text-white"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              {msg.createdAt && (
                <p className="text-xs opacity-60 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-neutral-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || isPending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
