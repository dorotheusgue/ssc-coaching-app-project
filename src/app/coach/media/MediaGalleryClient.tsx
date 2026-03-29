"use client";

import { useState } from "react";
import { Play, Image as ImageIcon, X } from "lucide-react";
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

export default function MediaGalleryClient({ items }: { items: MediaItem[] }) {
  const [selected, setSelected] = useState<MediaItem | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Media Gallery</h1>
        <p className="text-neutral-400 text-sm mt-1">
          Videos and images uploaded by athletes
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                className="w-full rounded-lg"
              />
            )}
            <p className="text-neutral-400 text-sm">{selected.fileName}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
