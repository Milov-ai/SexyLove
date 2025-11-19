import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVaultStore } from "@/store/vault.store";
import { LugarSchema, type Lugar } from "@/schemas/vault";
import { toast } from "sonner";
import {
  MapPin,
  Image as ImageIcon,
  Save,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Sparkles,
} from "lucide-react";
import ComboboxMultiple from "@/components/ui/ComboboxMultiple";
import { saveImageFile, deleteImage } from "@/services/image.service";
import { getCoordsFromName } from "@/lib/geo";

// Extended Schema for the form
const FormSchema = LugarSchema.omit({
  id: true,
  entradas: true,
  favorite: true,
  coordinates: true,
}).extend({
  coordinates: z.object({ lat: z.number(), lon: z.number() }).nullable(),
  calidad: z.array(z.string()).default([]),
  precio: z.array(z.string()).default([]),
  fotos: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof FormSchema>;

interface LugarEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lugar: Lugar | null;
}

const LugarEditModal = ({ open, onOpenChange, lugar }: LugarEditModalProps) => {
  const { updateLugar, deleteLugar, decryptedVault } = useVaultStore();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageIds, setExistingImageIds] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    // @ts-expect-error - zodResolver type mismatch with complex schema
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nombre: "",
      direccion: "",
      description: "",
      calidad: [],
      precio: [],
      fotos: [],
      coordinates: null,
      privacy: "private",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;
  const values = watch();

  useEffect(() => {
    if (open && lugar) {
      reset({
        nombre: lugar.nombre,
        direccion: lugar.direccion,
        description: lugar.description || "",
        calidad: lugar.calidad,
        precio: lugar.precio,
        fotos: lugar.fotos,
        coordinates: lugar.coordinates || null,
        privacy: lugar.privacy || "private",
      });
      setExistingImageIds(lugar.fotos);
      setImagePreviews([]); // New uploads
      setImageFiles([]);
      setImagesToDelete([]);
    }
  }, [open, lugar, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const markImageForDeletion = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  const restoreImage = (imageId: string) => {
    setImagesToDelete((prev) => prev.filter((id) => id !== imageId));
  };

  const handleDelete = async () => {
    if (!lugar) return;
    if (confirm("¿Estás seguro de que quieres eliminar este lugar?")) {
      try {
        await deleteLugar(lugar.id);
        toast.success("Lugar eliminado");
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Error al eliminar");
      }
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!lugar) return;
    setIsSubmitting(true);
    try {
      // 1. Geocode if needed
      let coords = data.coordinates;
      if (!coords && data.direccion && data.direccion !== lugar.direccion) {
        try {
          const fetchedCoords = await getCoordsFromName(data.direccion);
          if (fetchedCoords) {
            coords = { lat: fetchedCoords.lat, lon: fetchedCoords.lon };
          }
        } catch (err) {
          console.error("Geocoding failed", err);
        }
      }

      // 2. Handle Images
      // Delete marked images
      await Promise.all(imagesToDelete.map((id) => deleteImage(id)));

      // Save new images
      const newImageIds = await Promise.all(
        imageFiles.map((file) => saveImageFile(file)),
      );

      // Construct final photo list
      const finalPhotos = [
        ...existingImageIds.filter((id) => !imagesToDelete.includes(id)),
        ...newImageIds,
      ];

      // 3. Update Lugar
      await updateLugar({
        ...lugar,
        ...data,
        coordinates: coords || undefined,
        fotos: finalPhotos,
      });

      toast.success("Lugar actualizado");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!lugar) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0 bg-background">
        <DialogTitle className="sr-only">Editar Lugar</DialogTitle>
        <DialogDescription className="sr-only">
          Formulario para editar los detalles del lugar
        </DialogDescription>

        <div className="max-w-4xl w-full mx-auto h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                Editar Lugar
              </h2>
              <p className="text-muted-foreground">
                Refina los detalles de tu santuario.
              </p>
            </div>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="basic" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 bg-slate-900/50 p-1 rounded-xl mb-6">
                <TabsTrigger
                  value="basic"
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg"
                >
                  Esencia
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg"
                >
                  Ubicación
                </TabsTrigger>
                <TabsTrigger
                  value="vibe"
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg"
                >
                  Vibe
                </TabsTrigger>
                <TabsTrigger
                  value="photos"
                  className="data-[state=active]:bg-pink-600 data-[state=active]:text-white rounded-lg"
                >
                  Fotos
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto pr-2">
                <TabsContent value="basic" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="nombre" className="text-lg">
                      Nombre
                    </Label>
                    <Input
                      id="nombre"
                      {...register("nombre")}
                      className="text-xl p-6 bg-slate-900/50 border-slate-700 focus:border-pink-500"
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-sm">
                        {errors.nombre && String(errors.nombre.message)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-lg">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      className="min-h-[200px] text-lg p-4 bg-slate-900/50 border-slate-700 focus:border-pink-500 resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="direccion" className="text-lg">
                      Dirección
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="direccion"
                        {...register("direccion")}
                        className="pl-12 text-xl p-6 bg-slate-900/50 border-slate-700 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  {/* Map Placeholder */}
                  <div className="h-64 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                    <MapPin className="w-12 h-12 mb-2 opacity-20" />
                    <span className="sr-only">Mapa preview</span>
                  </div>
                </TabsContent>

                <TabsContent value="vibe" className="space-y-8 mt-0">
                  <div className="space-y-4">
                    <Label className="text-lg">Privacidad</Label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { value: "public", label: "Público", icon: Eye },
                        { value: "semi-private", label: "Semi", icon: Unlock },
                        { value: "private", label: "Privado", icon: Lock },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setValue(
                              "privacy",
                              option.value as
                                | "public"
                                | "semi-private"
                                | "private",
                            )
                          }
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            values.privacy === option.value
                              ? "border-pink-500 bg-pink-500/10 text-pink-500"
                              : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-600"
                          }`}
                        >
                          <option.icon className="w-8 h-8 mb-2" />
                          <span className="font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg">Etiquetas</Label>
                    <ComboboxMultiple
                      options={(decryptedVault?.categories || []).map((c) => ({
                        label: c,
                        value: c,
                      }))}
                      selectedValues={values.calidad || []}
                      onValueChange={(val) => setValue("calidad", val)}
                      placeholder="Selecciona etiquetas..."
                      label="Etiquetas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-lg">Precio</Label>
                    <div className="flex gap-2">
                      {["Gratis", "Económico", "Moderado", "Lujoso"].map(
                        (p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              const current = values.precio || [];
                              const exists = current.includes(p);
                              if (exists)
                                setValue(
                                  "precio",
                                  current.filter((x) => x !== p),
                                );
                              else setValue("precio", [...current, p]);
                            }}
                            className={`px-4 py-2 rounded-full border transition-all ${
                              values.precio?.includes(p)
                                ? "bg-green-500/20 border-green-500 text-green-500"
                                : "bg-slate-900 border-slate-700 text-slate-400"
                            }`}
                          >
                            {p}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="photos" className="space-y-6 mt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Existing Photos */}
                    {existingImageIds.map((id) => (
                      <div
                        key={id}
                        className={`relative aspect-square rounded-xl overflow-hidden group ${imagesToDelete.includes(id) ? "opacity-50 grayscale" : ""}`}
                      >
                        {/* We would need a way to resolve ID to URL here, assuming getImage(id) returns URL or we have a component */}
                        {/* For now, placeholder or assume we have a way to view them. In real app, use <img src={getImageUrl(id)} /> */}
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-600" />
                          <span className="text-xs text-slate-500 absolute bottom-2">
                            {id.slice(0, 4)}...
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            imagesToDelete.includes(id)
                              ? restoreImage(id)
                              : markImageForDeletion(id)
                          }
                          className={`absolute top-2 right-2 p-1 rounded-full transition-all ${
                            imagesToDelete.includes(id)
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {imagesToDelete.includes(id) ? (
                            <Sparkles className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ))}

                    {/* New Photos */}
                    {imagePreviews.map((src, index) => (
                      <div
                        key={`new-${index}`}
                        className="relative aspect-square rounded-xl overflow-hidden group"
                      >
                        <img
                          src={src}
                          alt={`New ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all">
                      <ImageIcon className="w-10 h-10 text-slate-500 mb-2" />
                      <span className="text-sm text-slate-500">Añadir</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <Button
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={handleSubmit(onSubmit as any)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white px-8"
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LugarEditModal;
