"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Play, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

type MediaItem = {
 id: number;
 athleteId: number;
 fileUrl: string;
 fileName: string;
 fileType: string;
 type: string;
 caption: string | null;
 createdAt: Date | null;
};

type RecentSession = {
 id: number;
 label: string;
 date: string;
};

export default function MediaUploadClient({
 items,
 athleteId,
 recentSessions,
}: {
 items: MediaItem[];
 athleteId: number;
 recentSessions: RecentSession[];
}) {
 const router = useRouter();
 const [uploading, setUploading] = useState(false);
 const [caption, setCaption] = useState("");
 const [linkedSessionId, setLinkedSessionId] = useState<string>("");
 const [selected, setSelected] = useState<MediaItem | null>(null);
 const [error, setError] = useState("");

 async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
 const file = e.target.files?.[0];
 if (!file) return;

 setUploading(true);
 setError("");

 const formData = new FormData();
 formData.append("file", file);

 try {
 const res = await fetch("/api/upload", { method: "POST", body: formData });
 const data = await res.json();

 if (data.error) {
 setError(data.error);
 return;
 }

 const mediaType = file.type.startsWith("video/") ? "video" : "image";

 const saveFormData = new FormData();
 saveFormData.set("athleteId", String(athleteId));
 saveFormData.set("fileUrl", data.url);
 saveFormData.set("fileName", data.fileName);
 saveFormData.set("fileType", data.fileType);
 saveFormData.set("fileSize", String(data.fileSize));
 saveFormData.set("type", mediaType);
 saveFormData.set("caption", caption);
 if (linkedSessionId) {
 saveFormData.set("assignedSessionId", linkedSessionId);
 }

 const { saveMediaAction } = await import("./actions");
 await saveMediaAction(saveFormData);

 setCaption("");
 setLinkedSessionId("");
 router.refresh();
 } catch {
 setError("Upload failed");
 } finally {
 setUploading(false);
 }
 }

 return (
 <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
 <div>
 <h1 className="text-2xl font-bold text-ink">My Media</h1>
 <p className="text-mute text-sm mt-1">
 Upload videos for your coach to review
 </p>
 </div>

 <div className="bg-surface border border-line p-6">
 <h2 className="text-lg font-semibold text-ink mb-4">Upload</h2>
 {error && (
 <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-4">
 {error}
 </div>
 )}
 <div className="space-y-3">
 <input
 type="text"
 value={caption}
 onChange={(e) => setCaption(e.target.value)}
 placeholder="Caption (optional)"
 className="w-full bg-surface border border-line px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 />
 {recentSessions.length > 0 && (
 <select
 value={linkedSessionId}
 onChange={(e) => setLinkedSessionId(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-ink"
 >
 <option value="">Link to session (optional)</option>
 {recentSessions.map((s) => (
 <option key={s.id} value={s.id}>
 {s.date} · {s.label}
 </option>
 ))}
 </select>
 )}
 <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-line cursor-pointer hover:border-ink transition-colors">
 <Upload className="w-5 h-5 text-mute" />
 <span className="text-mute text-sm">
 {uploading ? "Uploading..." : "Choose file (video or image)"}
 </span>
 <input
 type="file"
 accept="video/*,image/*"
 onChange={handleUpload}
 disabled={uploading}
 className="hidden"
 />
 </label>
 </div>
 </div>

 {items.length === 0 ? (
 <div className="text-center py-12 text-faint">
 <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
 <p>No media uploaded yet</p>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-4">
 {items.map((item) => (
 <button
 key={item.id}
 onClick={() => setSelected(item)}
 className="bg-surface border border-line overflow-hidden hover:border-line transition-colors text-left"
 >
 <div className="aspect-video bg-surface flex items-center justify-center">
 {item.type === "video" ? (
 <Play className="w-10 h-10 text-mute" />
 ) : (
 <ImageIcon className="w-10 h-10 text-mute" />
 )}
 </div>
 <div className="p-3">
 <p className="text-ink text-sm font-medium truncate">
 {item.caption || item.fileName}
 </p>
 <p className="text-faint text-xs mt-1">
 {item.createdAt
 ? new Date(item.createdAt).toLocaleDateString()
 : ""}
 </p>
 </div>
 </button>
 ))}
 </div>
 )}

 <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.caption || selected?.fileName || ""}>
 {selected && (
 <div className="space-y-4">
 {selected.type === "video" ? (
 <video
 src={selected.fileUrl}
 controls
 className="w-full "
 />
 ) : (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={selected.fileUrl}
 alt={selected.caption || ""}
 className="w-full "
 />
 )}
 </div>
 )}
 </Modal>
 </div>
 );
}
