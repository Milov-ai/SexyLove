import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNotesStore } from "@/store/notes.store";

interface MediaUploaderProps {
  noteId: string;
}

const MediaUploader = ({ noteId }: MediaUploaderProps) => {
  const { addMedia } = useNotesStore();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${noteId}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("notes-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("notes-media").getPublicUrl(filePath);

      await addMedia({
        note_id: noteId,
        url: publicUrl,
        type: file.type.startsWith("video") ? "video" : "image",
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      alert("Error al subir la imagen");
    } finally {
      setIsUploading(false);
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
