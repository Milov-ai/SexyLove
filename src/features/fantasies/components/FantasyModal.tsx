import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useVaultStore } from "@/store/vault.store";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect } from "react";
import { Loader2, XCircle } from "lucide-react";
import FullScreenModal from "@/components/ui/FullScreenModal";
import ComboboxMultiple from "@/components/ui/ComboboxMultiple";
import { saveImage, getImage, deleteImage } from "@/services/image.service";
import { FantasySchema, type Fantasy } from "@/schemas/vault";

// We omit fields that are set automatically or have custom controls
const FormSchema = FantasySchema.omit({
  id: true,
  created_by: true,
  created_at: true,
  reference_image: true,
});
type FantasyForm = z.infer<typeof FormSchema>;

interface FantasyModalProps {
  fantasy: Fantasy | null; // null for create, object for edit
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FantasyModal = ({ fantasy, open, onOpenChange }: FantasyModalProps) => {
  const { decryptedVault, addFantasy, updateFantasy } = useVaultStore();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm<FantasyForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(FormSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      toys: [],
      settingPlaces: [],
      location_id: undefined,
      priority: 3,
    },
  });

  const priorityValue = watch("priority");

  useEffect(() => {
    if (open) {
      if (fantasy) {
        // Edit mode
        reset({
          title: fantasy.title,
          description: fantasy.description || "",
          toys: fantasy.toys || [],
          settingPlaces: fantasy.settingPlaces || [],
          location_id: fantasy.location_id,
          priority: fantasy.priority || 3,
        });
        if (fantasy.reference_image) {
          getImage(fantasy.reference_image).then((url) =>
            setImagePreview(url || null),
          );
        }
      } else {
        // Create mode
        reset();
      }
    } else {
      // Reset everything on close
      reset();
      setImagePreview(null);
      setImageFile(null);
      setError(null);
    }
  }, [open, fantasy, reset]);

  // if (!decryptedVault) {
  //   return null;
  // }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FantasyForm) => {
    setIsSubmitting(true);
    setError(null);
    try {
      let imageId = fantasy?.reference_image;

      // Handle image update/upload
      if (imageFile) {
        // If there was an old image, delete it
        if (fantasy?.reference_image) {
          await deleteImage(fantasy.reference_image);
        }
        imageId = uuidv4();
        await saveImage(imageId, imagePreview!); // imagePreview will be set if imageFile is set
      }

      const fantasyData: Fantasy = {
        id: fantasy?.id || uuidv4(),
        created_at: fantasy?.created_at || new Date(),
        created_by:
          fantasy?.created_by || decryptedVault?.user.username || "Unknown",
        ...data,
        reference_image: imageId,
      };

      if (fantasy) {
        updateFantasy(fantasyData);
      } else {
        addFantasy(fantasyData);
      }
      onOpenChange(false);
    } catch (err: unknown) {
      setError("Error guardando la fantasía. Inténtalo de nuevo.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toyOptions =
    decryptedVault && decryptedVault.toys
      ? decryptedVault.toys.map((t) => ({ value: t, label: t }))
      : [];
  const placeOptions =
    decryptedVault && decryptedVault.settingPlaces
      ? decryptedVault.settingPlaces.map((p) => ({ value: p, label: p }))
      : [];
  const locationOptions =
    decryptedVault && decryptedVault.lugares
      ? decryptedVault.lugares.map((l) => ({ value: l.id, label: l.nombre }))
      : [];

  return (
    <FullScreenModal
      open={open}
      onOpenChange={onOpenChange}
      title={fantasy ? "Editar Fantasía" : "Crear Nueva Fantasía"}
      description="Detalla tus deseos más profundos."
      footer={
        <Button type="submit" form="fantasy-form" disabled={isSubmitting}>
          {" "}
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}{" "}
          Guardar Fantasía
        </Button>
      }
    >
      <form
        id="fantasy-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex-grow overflow-y-auto p-4 grid gap-4"
      >
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Título
          </Label>
          <Input id="title" {...register("title")} className="col-span-3" />
          {errors.title && (
            <p className="col-span-4 text-red-500 text-xs text-right">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Descripción
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            className="col-span-3"
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="priority" className="text-right">
            Prioridad
          </Label>
          <div className="col-span-3 flex items-center gap-4">
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Slider
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              )}
            />
            <span className="text-sm font-medium w-8 text-right">
              {priorityValue}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="toys" className="text-right">
            Juguetes
          </Label>
          <div className="col-span-3">
            <Controller
              control={control}
              name="toys"
              render={({ field }) => (
                <ComboboxMultiple
                  options={toyOptions}
                  selectedValues={field.value}
                  onValueChange={field.onChange}
                  label="Juguetes"
                  placeholder="Selecciona juguetes..."
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="settingPlaces" className="text-right">
            Lugar (Tipo)
          </Label>
          <div className="col-span-3">
            <Controller
              control={control}
              name="settingPlaces"
              render={({ field }) => (
                <ComboboxMultiple
                  options={placeOptions}
                  selectedValues={field.value}
                  onValueChange={field.onChange}
                  label="Lugares"
                  placeholder="Selecciona tipos de lugar..."
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="location_id" className="text-right">
            Ubicación
          </Label>
          <div className="col-span-3">
            {/* A single-select combobox would be better here, but using the multiple one for now */}
            <Controller
              control={control}
              name="location_id"
              render={({ field }) => (
                <ComboboxMultiple
                  options={locationOptions}
                  selectedValues={field.value ? [field.value] : []}
                  onValueChange={(vals) => field.onChange(vals[0] || undefined)}
                  label="Ubicación"
                  placeholder="Selecciona una ubicación..."
                />
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="reference_image" className="text-right">
            Imagen
          </Label>
          <div className="col-span-3">
            <Input
              id="referenceImage"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="relative w-24 h-24 mt-2 group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && <p className="col-span-4 text-red-500 text-sm">{error}</p>}
      </form>
    </FullScreenModal>
  );
};

export default FantasyModal;
