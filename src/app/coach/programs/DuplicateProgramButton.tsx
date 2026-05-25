"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { duplicateProgram } from "./actions";

export function DuplicateProgramButton({ programId }: { programId: number }) {
 const router = useRouter();
 const [isPending, startTransition] = useTransition();
 const [done, setDone] = useState(false);

 function onClick(e: React.MouseEvent) {
 e.preventDefault();
 e.stopPropagation();
 startTransition(async () => {
 await duplicateProgram(programId);
 setDone(true);
 router.refresh();
 setTimeout(() => setDone(false), 1500);
 });
 }

 return (
 <button
 type="button"
 onClick={onClick}
 disabled={isPending}
 title="Duplicate program"
 className="p-1.5 text-mute hover:text-ink hover:bg-hover transition-colors cursor-pointer disabled:opacity-50"
 >
 <Copy className="w-4 h-4" />
 {done && <span className="sr-only">Duplicated</span>}
 </button>
 );
}
