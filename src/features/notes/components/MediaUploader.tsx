import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useNotesStore } from "@/store/notes.store";
import { useMediaUpload } from "../hooks/useMediaUpload";

interface MediaUploaderProps {
  noteId: string;
}

const MediaUploader = ({ noteId }: MediaUploaderProps) => {
  const { addMedia } = useNotesStore();
  const { uploadMedia, isUploading } = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const publicUrl = await uploadMedia(file, noteId);

    if (publicUrl) {
      await addMedia({
        note_id: noteId,
        url: publicUrl,
        type: file.type.startsWith("video") ? "video" : "image",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*"
        className="hidden"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
      >
        {isUploading ? (
          <Loader2 className="animate-spin" size={20} />
        ) : (
          <ImageIcon size={20} />
        )}
      </Button>
    </>
  );
};

export default MediaUploader;
