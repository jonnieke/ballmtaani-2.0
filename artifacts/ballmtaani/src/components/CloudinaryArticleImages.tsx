import { useRef, useState } from "react";
import { Upload, Copy, Check, Trash2, Loader2, Images } from "lucide-react";
import { uploadToCloudinary, CLOUDINARY_MAX_KB, cloudinaryConfigured } from "../lib/cloudinary";

interface UploadedImage {
  id: string;
  url: string;
  name: string;
}

export default function CloudinaryArticleImages() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError("");
    const toUpload = Array.from(files).slice(0, 10);
    setUploading(true);
    const results: UploadedImage[] = [];
    for (const file of toUpload) {
      try {
        const url = await uploadToCloudinary(file);
        results.push({ id: `${Date.now()}-${Math.random()}`, url, name: file.name });
      } catch (e: any) {
        setError(e.message || "One or more uploads failed");
      }
    }
    setImages(prev => [...prev, ...results]);
    setUploading(false);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  }

  function copyTag(img: UploadedImage, type: "url" | "html") {
    const text = type === "html" ? `<img src="${img.url}" alt="" />` : img.url;
    navigator.clipboard.writeText(text);
    setCopiedId(`${img.id}-${type}`);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function remove(id: string) {
    setImages(prev => prev.filter(i => i.id !== id));
  }

  if (!cloudinaryConfigured()) return null;

  return (
    <div className="rounded-xl border border-white/8 bg-[#090c12] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/6 px-4 py-3">
        <Images className="h-3.5 w-3.5 text-white/35" />
        <span className="text-[11px] font-black uppercase tracking-widest text-white/55">Article Images</span>
        <span className="text-[9px] text-white/25">— upload images to embed in content</span>
      </div>

      <div className="p-4 space-y-4">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="sr-only" onChange={onInputChange} />

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-white/12 bg-white/[0.02] py-5 transition-all hover:border-[#FFD700]/25 hover:bg-white/[0.04] disabled:opacity-50"
        >
          {uploading
            ? <><Loader2 className="h-4 w-4 animate-spin text-[#FFD700]/50" /><span className="text-xs text-white/35">Uploading…</span></>
            : <><Upload className="h-4 w-4 text-white/25" /><span className="text-xs font-bold text-white/35">Click or drag images here</span><span className="text-[10px] text-white/18">· max {CLOUDINARY_MAX_KB} KB each</span></>
          }
        </button>

        {error && <p className="text-[11px] text-[#ff6b6b]">{error}</p>}

        {/* Uploaded gallery */}
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/25">Uploaded — copy URL or HTML tag to paste into content</p>
            <div className="space-y-2">
              {images.map(img => (
                <div key={img.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0d1018] p-2">
                  <img src={img.url} alt={img.name} className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-white/40">{img.name}</p>
                    <p className="truncate font-mono text-[9px] text-white/20">{img.url}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => copyTag(img, "url")}
                      className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/5 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-white/40 transition-colors hover:bg-white/10 hover:text-white">
                      {copiedId === `${img.id}-url` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      URL
                    </button>
                    <button type="button" onClick={() => copyTag(img, "html")}
                      className="flex items-center gap-1 rounded-lg border border-[#FFD700]/15 bg-[#FFD700]/5 px-2 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#FFD700]/60 transition-colors hover:bg-[#FFD700]/10 hover:text-[#FFD700]">
                      {copiedId === `${img.id}-html` ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      &lt;img&gt;
                    </button>
                    <button type="button" onClick={() => remove(img.id)}
                      className="rounded-lg p-1.5 text-white/20 transition-colors hover:bg-[#B30000]/15 hover:text-[#B30000]">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-[9px] leading-relaxed text-white/18">
          Paste the copied <code className="font-mono">&lt;img src="..."&gt;</code> tag directly into the article content textarea where you want the image to appear.
        </p>
      </div>
    </div>
  );
}
