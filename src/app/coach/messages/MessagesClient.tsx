"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
 Send,
 MessageSquare,
 Plus,
 Paperclip,
 X,
 Loader2,
 Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
 sendMessageAction,
 createConversationAction,
 markReadAction,
} from "./actions";

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
 mediaUrl: string | null;
 mediaType: string | null;
 assignedSessionId: number | null;
 sessionLabel: string | null;
 sessionDate: string | null;
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
 const [attachment, setAttachment] = useState<{
 url: string;
 type: string;
 name: string;
 } | null>(null);
 const [uploading, setUploading] = useState(false);
 const [showNewConvo, setShowNewConvo] = useState(false);
 const [isPending, startTransition] = useTransition();
 const messagesEndRef = useRef<HTMLDivElement>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (selectedConvo) {
 fetch(`/api/messages/${selectedConvo}`)
 .then((r) => r.json())
 .then((data) => setMessages(data.messages ?? []));
 void markReadAction(selectedConvo, coachId).then(() => router.refresh());
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [selectedConvo, coachId]);

 useEffect(() => {
 messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
 }, [messages]);

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
 if ((!text && !attachment) || !selectedConvo) return;
 const localAttachment = attachment;
 setNewMessage("");
 setAttachment(null);
 setMessages((prev) => [
 ...prev,
 {
 id: Date.now(),
 senderId: coachId,
 text:
 text ||
 (localAttachment?.type.startsWith("video") ? "[video]" : "[attachment]"),
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
 formData.set("conversationId", String(selectedConvo));
 formData.set("senderId", String(coachId));
 formData.set("text", text);
 if (localAttachment) {
 formData.set("mediaUrl", localAttachment.url);
 formData.set("mediaType", localAttachment.type);
 }
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
 <div className="w-80 border-r border-line flex flex-col bg-surface">
 <div className="p-4 border-b border-line flex items-center justify-between">
 <h2 className="text-lg font-semibold text-ink">Messages</h2>
 <button
 onClick={() => setShowNewConvo(true)}
 className="p-1.5 hover:bg-hover text-mute hover:text-ink transition-colors"
 >
 <Plus className="w-5 h-5" />
 </button>
 </div>
 <div className="flex-1 overflow-y-auto">
 {conversations.length === 0 ? (
 <div className="p-4 text-center text-faint text-sm">
 No conversations yet
 </div>
 ) : (
 conversations.map((c) => (
 <button
 key={c.id}
 onClick={() => setSelectedConvo(c.id)}
 className={`w-full p-4 text-left border-b border-line hover:bg-hover transition-colors ${
 selectedConvo === c.id ? "bg-surface" : ""
 }`}
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 bg-ink/20 flex items-center justify-center text-ink font-semibold text-sm">
 {c.athleteName.charAt(0)}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-ink font-medium text-sm truncate">
 {c.athleteName}
 </div>
 <div className="text-mute text-xs truncate">
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
 <div className="p-4 border-b border-line bg-surface">
 <div className="text-ink font-medium">
 {conversations.find((c) => c.id === selectedConvo)?.athleteName}
 </div>
 </div>
 <div className="flex-1 overflow-y-auto p-4 space-y-3">
 {messages.map((msg) => {
 const mine = msg.senderId === coachId;
 const isVideo = msg.mediaType?.startsWith("video");
 const isImage = msg.mediaType?.startsWith("image");
 return (
 <div
 key={msg.id}
 className={`flex ${mine ? "justify-end" : "justify-start"}`}
 >
 <div
 className={`max-w-[70%] overflow-hidden ${
 mine
 ? "bg-ink text-bg"
 : "bg-surface text-ink"
 }`}
 >
 {msg.assignedSessionId && msg.sessionLabel && (
 <div
 className={`px-3 py-1.5 text-xs flex items-center gap-1.5 border-b ${
 mine
 ? "bg-ink/40 border-line"
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
 <div className="p-4 border-t border-line bg-surface space-y-2">
 {attachment && (
 <div className="flex items-center gap-2 px-3 py-2 bg-surface/50 border border-line ">
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
 className="p-2 bg-surface hover:bg-hover text-ink hover:text-ink transition-colors disabled:opacity-50 cursor-pointer"
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
 className="flex-1 bg-surface border border-line px-4 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 <Button
 onClick={handleSend}
 disabled={(!newMessage.trim() && !attachment) || isPending}
 >
 <Send className="w-4 h-4" />
 </Button>
 </div>
 </div>
 </>
 ) : (
 <div className="flex-1 flex items-center justify-center text-faint">
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
 className="w-full p-3 text-left bg-surface hover:bg-hover text-ink transition-colors"
 >
 {a.name}
 </button>
 ))}
 </div>
 </Modal>
 </div>
 );
}
