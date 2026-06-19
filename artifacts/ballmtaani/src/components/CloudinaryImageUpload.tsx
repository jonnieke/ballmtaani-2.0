import { useRef, useState } from "react";
import { Upload, X, Copy, Check, ImageIcon, Loader2 } from "lucide-react";
import { uploadToCloudinary, CLOUDINARY_MAX_KB, cloudinaryConfigured } from "../lib/cloudinary";

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function CloudinaryImageUpload({ value, onChange, label = "Image" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleFile(file: File) {
    setError("");
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      onChange(url);
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  function copyUrl() {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!cloudinaryConfigured()) {
    return (
      <div>
        {label && <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>}
        <div className="rounded-xl border border-[#FFD700]/20 bg-[#FFD700]/5 px-4 py-3 text-xs text-[#FFD700]/70">
          Cloudinary not configured — add <code className="font-mono text-[#FFD700]">VITE_CLOUDINARY_CLOUD_NAME</code> and{" "}
          <code className="font-mono text-[#FFD700]">VITE_CLOUDINARY_UPLOAD_PRESET</code> to your env.
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-white/40">{label}</label>}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={onInputChange} />

      {value ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="relative h-48 bg-[#0a0d14]">
            <img src={value} alt="Cover" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate rounded-md bg-black/70 px-2 py-1 font-mono text-[9px] text-white/50 backdrop-blur-sm">
                {value}
              </p>
              <button type="button" onClick={copyUrl}
                className="shrink-0 rounded-md bg-black/70 px-2 py-1 backdrop-blur-sm transition-colors hover:bg-white/20"
                title="Copy URL">
                {copied
                  ? <Check className="h-3.5 w-3.5 text-green-400" />
                  : <Copy className="h-3.5 w-3.5 text-white/50" />}
              </button>
              <button type="button" onClick={() => inputRef.current?.click()}
                className="shrink-0 rounded-md bg-black/70 px-2 py-1 text-[10px] font-black text-white/60 backdrop-blur-sm transition-colors hover:bg-white/20">
                Replace
              </button>
              <button type="button" onClick={() => onChange("")}
                className="shrink-0 rounded-md bg-[#B30000]/80 p-1 backdrop-blur-sm transition-colors hover:bg-[#B30000]">
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.03] py-10 transition-all hover:border-[#FFD700]/30 hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 animate-spin text-[#FFD700]/60" />
              <p className="text-xs font-bold text-white/35">Uploading to Cloudinary…</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <ImageIcon className="h-5 w-5 text-white/30" />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-white/55">Click or drag to upload cover image</p>
                <p className="mt-0.5 text-[10px] text-white/25">Max {CLOUDINARY_MAX_KB} KB · JPG, PNG, WebP</p>
              </div>
            </>
          )}
        </button>
      )}

      {error && <p className="mt-1.5 text-[11px] text-[#ff6b6b]">{error}</p>}
    </div>
  );
}
