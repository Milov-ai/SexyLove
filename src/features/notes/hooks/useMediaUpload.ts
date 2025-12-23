import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useMediaUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadMedia = async (file: File, folder: string) => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("notes-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("notes-media").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Error al subir la imagen");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadMedia, isUploading };
};
