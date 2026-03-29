"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { sendMessageAction, createConversationAction } from "./actions";

type Conversation = {
  id: number;
  athleteId: number;
  athleteName: string;
  lastMessageAt: Date | null;
  lastMessage: string;
};

type Athlete = { id: number; name: string };

type Message = {
  id: number;
  senderId: number;
  text: string;
  createdAt: Date | null;
};

export default function MessagesClient({
  conversations,
  athletes,
  coachId,
}: {
  conversations: Conversation[];
  athletes: Athlete[];
  coachId: number;
}) {
  const router = useRouter();
  const [selectedConvo, setSelectedConvo] = useState<number | null>(
    conversations[0]?.id ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConvo) {
      fetch(`/api/messages/${selectedConvo}`)
        .then((r) => r.json())
        .then((data) => setMessages(data.messages ?? []));
    }
  }, [selectedConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!newMessage.trim() || !selectedConvo) return;
    const text = newMessage;
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), senderId: coachId, text, createdAt: new Date() },
    ]);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("conversationId", String(selectedConvo));
      formData.set("senderId", String(coachId));
      formData.set("text", text);
      await sendMessageAction(formData);
      router.refresh();
    });
  }

  async function handleNewConversation(athleteId: number) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("coachId", String(coachId));
      formData.set("athleteId", String(athleteId));
      const result = await createConversationAction(formData);
      setShowNewConvo(false);
      router.refresh();
      if (result.conversationId) {
        setSelectedConvo(result.conversationId);
      }
    });
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className="w-80 border-r border-neutral-700 flex flex-col bg-neutral-850">
        <div className="p-4 border-b border-neutral-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Messages</h2>
          <button
            onClick={() => setShowNewConvo(true)}
            className="p-1.5 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-neutral-500 text-sm">
              No conversations yet
            </div>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConvo(c.id)}
                className={`w-full p-4 text-left border-b border-neutral-700 hover:bg-neutral-750 transition-colors ${
                  selectedConvo === c.id ? "bg-neutral-750" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm">
                    {c.athleteName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm truncate">
                      {c.athleteName}
                    </div>
                    <div className="text-neutral-400 text-xs truncate">
                      {c.lastMessage || "No messages yet"}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConvo ? (
          <>
            <div className="p-4 border-b border-neutral-700 bg-neutral-850">
              <div className="text-white font-medium">
                {conversations.find((c) => c.id === selectedConvo)?.athleteName}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === coachId ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.senderId === coachId
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
            <div className="p-4 border-t border-neutral-700 bg-neutral-850">
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-neutral-500">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      <Modal open={showNewConvo} onClose={() => setShowNewConvo(false)} title="New Conversation">
        <div className="space-y-2">
          {athletes.map((a) => (
            <button
              key={a.id}
              onClick={() => handleNewConversation(a.id)}
              className="w-full p-3 text-left rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
            >
              {a.name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
