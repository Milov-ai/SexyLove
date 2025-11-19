import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useVaultStore } from "@/store/vault.store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ComboboxMultiple from "@/components/ui/ComboboxMultiple";
import { saveImageFile, getImage, deleteImage } from "@/services/image.service";
import { Loader2, XCircle, CalendarIcon, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { EntradaSchema, type Entrada } from "@/schemas/vault";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const EntradaFormSchema = EntradaSchema.omit({ id: true, fotos: true });
type EntradaForm = z.infer<typeof EntradaFormSchema>;

interface EntradaEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entrada: Entrada;
  lugarId: string;
}

export function EntradaEditModal({
  open,
  onOpenChange,
  entrada,
  lugarId,
}: EntradaEditModalProps) {
  const { updateEntrada, decryptedVault } = useVaultStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<EntradaForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(EntradaFormSchema) as any,
    defaultValues: {
      title: entrada.title,
      fecha: new Date(entrada.fecha),
      rating: entrada.rating,
      participants: entrada.participants || [],
      tags: entrada.tags || [],
      description: entrada.description || "",
      toys: entrada.toys || [],
      settingPlaces: entrada.settingPlaces || [],
    },
  });

  const ratingValue = watch("rating");

  useEffect(() => {
    if (open) {
      reset({
        title: entrada.title,
        fecha: new Date(entrada.fecha),
        rating: entrada.rating,
        participants: entrada.participants || [],
        tags: entrada.tags || [],
        description: entrada.description || "",
        toys: entrada.toys || [],
        settingPlaces: entrada.settingPlaces || [],
      });
      setExistingImageIds(entrada.fotos || []);
      setImagesToDelete([]);
      setImageFiles([]);

      const loadPreviews = async () => {
        if (entrada.fotos) {
          const urls = await Promise.all(
            entrada.fotos.map((id) => getImage(id)),
          );
          const validUrls = urls.filter((url) => url !== null) as string[];
          setImagePreviews(validUrls);
        } else {
          setImagePreviews([]);
        }
      };
      loadPreviews();
    }
  }, [open, entrada, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (
    indexToRemove: number,
    isExisting: boolean,
    imageId?: string,
  ) => {
    if (isExisting && imageId) {
      setExistingImageIds((prev) => prev.filter((id) => id !== imageId));
      setImagesToDelete((prev) => [...prev, imageId]);
      setImagePreviews((prev) =>
        prev.filter((_, index) => index !== indexToRemove),
      );
    } else {
      const numExisting = existingImageIds.length;
      if (indexToRemove < numExisting) {
        const idToRemove = existingImageIds[indexToRemove];
        setExistingImageIds((prev) => prev.filter((id) => id !== idToRemove));
        setImagesToDelete((prev) => [...prev, idToRemove]);
      } else {
        const newImageIndex = indexToRemove - numExisting;
        setImageFiles((prev) => prev.filter((_, i) => i !== newImageIndex));
      }
      setImagePreviews((prev) =>
        prev.filter((_, index) => index !== indexToRemove),
      );
    }
  };

  const onSubmit = async (data: EntradaForm) => {
    setIsSubmitting(true);
    try {
      const newFotoIds: string[] = [...existingImageIds];

      const newSavedIds = await Promise.all(
        imageFiles.map((file) => saveImageFile(file)),
      );
      newFotoIds.push(...newSavedIds);

      for (const id of imagesToDelete) {
        await deleteImage(id);
      }

      const updatedEntrada: Entrada = {
        ...entrada,
        ...data,
        fotos: newFotoIds,
      };
      await updateEntrada(lugarId, updatedEntrada);
      onOpenChange(false);
      toast.success("Entrada actualizada correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar la entrada");
    } finally {
      setIsSubmitting(false);
    }
  };

  const participantOptions = [
    { value: "yo", label: "Yo" },
    { value: "ella", label: "Ella" },
  ];
  const tagOptions = (decryptedVault?.categories || []).map((c) => ({
    label: c,
    value: c,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Editar Entrada</DialogTitle>
          <DialogDescription>
            Actualiza los detalles de este recuerdo.
          </DialogDescription>
        </DialogHeader>

        <form
          id="entrada-edit-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-1 grid gap-6"
        >
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Controller
                control={control}
                name="fecha"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Elige una fecha</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
            <div className="grid gap-2">
              <Label>Calificación: {ratingValue.toFixed(1)}</Label>
              <Controller
                control={control}
                name="rating"
                render={({ field }) => (
                  <Slider
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    max={5}
                    step={0.5}
                    className="py-2"
                  />
                )}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Participantes</Label>
            <Controller
              control={control}
              name="participants"
              render={({ field }) => (
                <ComboboxMultiple
                  options={participantOptions}
                  selectedValues={field.value || []}
                  onValueChange={field.onChange}
                  label="Participantes"
                  placeholder="Selecciona participantes..."
                />
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label>Etiquetas</Label>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <ComboboxMultiple
                  options={tagOptions}
                  selectedValues={field.value || []}
                  onValueChange={field.onChange}
                  label="Etiquetas"
                  placeholder="Selecciona etiquetas..."
                />
              )}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              className="min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <Label>Fotos ({imagePreviews.length})</Label>
            <div className="flex flex-wrap gap-4">
              {imagePreviews.map((src, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 group rounded-md overflow-hidden border border-slate-700"
                >
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(
                        index,
                        index < existingImageIds.length,
                        existingImageIds[index],
                      );
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-md cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-colors">
                <span className="text-xs text-slate-500">Añadir</span>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t border-slate-800">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="entrada-edit-form"
            disabled={isSubmitting}
            className="bg-pink-600 hover:bg-pink-700 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EntradaEditModal;
