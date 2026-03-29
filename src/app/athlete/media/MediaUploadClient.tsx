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

export default function MediaUploadClient({
  items,
  athleteId,
}: {
  items: MediaItem[];
  athleteId: number;
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
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

      const { saveMediaAction } = await import("./actions");
      await saveMediaAction(saveFormData);

      setCaption("");
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
        <h1 className="text-2xl font-bold text-white">My Media</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Upload videos for your coach to review
        </p>
      </div>

      <div className="bg-neutral-800 rounded-xl border border-neutral-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload</h2>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full bg-neutral-700 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
            <Upload className="w-5 h-5 text-neutral-400" />
            <span className="text-neutral-400 text-sm">
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
        <div className="text-center py-12 text-neutral-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden hover:border-neutral-600 transition-colors text-left"
            >
              <div className="aspect-video bg-neutral-750 flex items-center justify-center">
                {item.type === "video" ? (
                  <Play className="w-10 h-10 text-neutral-400" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-neutral-400" />
                )}
              </div>
              <div className="p-3">
                <p className="text-white text-sm font-medium truncate">
                  {item.caption || item.fileName}
                </p>
                <p className="text-neutral-500 text-xs mt-1">
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
                className="w-full rounded-lg"
              />
            ) : (
              <img
                src={selected.fileUrl}
                alt={selected.caption || ""}
                className="w-full rounded-lg" // eslint-disable-line @next/next/no-img-element
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
