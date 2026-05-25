"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Paperclip, X, Loader2, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { sendMessageAction, markReadAction } from "@/app/coach/messages/actions";

type Message = {
  id: number;
  senderId: number;
  text: string;
  mediaUrl: string | null;
  mediaType: string | null;
  assignedSessionId: number | null;
  sessionLabel: string | null;
  sessionDate: string | null;
  createdAt: Date | null;
};

export default function AthleteMessagesClient({
  conversationId,
  coachName,
  messages: initialMessages,
  athleteId,
}: {
  conversationId: number;
  coachName: string;
  messages: Message[];
  athleteId: number;
}) {
  const router = useRouter();
  const [msgs, setMsgs] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState<{
    url: string;
    type: string;
    name: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    void markReadAction(conversationId, athleteId).then(() => router.refresh());
    // Only run on mount per conversation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, athleteId]);

  async function handleAttach(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 50_000_000) {
      alert("File too large (max 50 MB).");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAttachment({ url: data.url, type: data.fileType, name: data.fileName });
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSend() {
    const text = newMessage.trim();
    if (!text && !attachment) return;
    const localAttachment = attachment;
    setNewMessage("");
    setAttachment(null);
    setMsgs((prev) => [
      ...prev,
      {
        id: Date.now(),
        senderId: athleteId,
        text: text || (localAttachment?.type.startsWith("video") ? "[video]" : "[attachment]"),
        mediaUrl: localAttachment?.url ?? null,
        mediaType: localAttachment?.type ?? null,
        assignedSessionId: null,
        sessionLabel: null,
        sessionDate: null,
        createdAt: new Date(),
      },
    ]);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("conversationId", String(conversationId));
      formData.set("senderId", String(athleteId));
      formData.set("text", text);
      if (localAttachment) {
        formData.set("mediaUrl", localAttachment.url);
        formData.set("mediaType", localAttachment.type);
      }
      await sendMessageAction(formData);
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="p-4 border-b border-line">
        <h1 className="text-lg font-semibold text-ink">{coachName}</h1>
        <p className="text-mute text-sm">Your coach</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 && (
          <div className="text-center text-faint text-sm py-8">
            Start a conversation with your coach
          </div>
        )}
        {msgs.map((msg) => {
          const mine = msg.senderId === athleteId;
          const isVideo = msg.mediaType?.startsWith("video");
          const isImage = msg.mediaType?.startsWith("image");
          return (
            <div
              key={msg.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl overflow-hidden ${
                  mine ? "bg-emerald-600 text-ink" : "bg-surface text-ink"
                }`}
              >
                {msg.assignedSessionId && msg.sessionLabel && (
                  <div
                    className={`px-3 py-1.5 text-xs flex items-center gap-1.5 border-b ${
                      mine
                        ? "bg-emerald-700/40 border-emerald-700/50"
                        : "bg-surface/60 border-line"
                    }`}
                  >
                    <Dumbbell className="w-3 h-3 opacity-70" />
                    <span className="opacity-90">
                      {msg.sessionLabel}
                      {msg.sessionDate && ` · ${msg.sessionDate}`}
                    </span>
                  </div>
                )}
                {msg.mediaUrl && isVideo && (
                  <video
                    src={msg.mediaUrl}
                    controls
                    className="block max-w-full"
                    preload="metadata"
                  />
                )}
                {msg.mediaUrl && isImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={msg.mediaUrl}
                    alt={msg.text}
                    className="block max-w-full"
                  />
                )}
                <div className="px-4 py-2">
                  {msg.text &&
                    msg.text !== "[video]" &&
                    msg.text !== "[attachment]" && (
                      <p className="text-sm">{msg.text}</p>
                    )}
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
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-line space-y-2">
        {attachment && (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface/50 border border-line rounded-lg">
            <Paperclip className="w-4 h-4 text-mute shrink-0" />
            <span className="text-xs text-ink truncate flex-1">
              {attachment.name}
            </span>
            <button
              onClick={() => setAttachment(null)}
              className="text-mute hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || isPending}
            className="p-2 rounded-lg bg-surface hover:bg-hover text-ink hover:text-ink transition-colors disabled:opacity-50 cursor-pointer"
            title="Attach video or image"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,image/*"
            onChange={handleAttach}
            className="hidden"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-surface border border-line rounded-lg px-4 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            onClick={handleSend}
            disabled={(!newMessage.trim() && !attachment) || isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
