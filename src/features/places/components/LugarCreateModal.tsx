import { useState, useEffect } from "react";
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
import { useVaultStore } from "@/store/vault.store";
import { LugarSchema } from "@/schemas/vault";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Image as ImageIcon,
  Star,
  ArrowRight,
  ArrowLeft,
  Save,
  Sparkles,
  Lock,
  Unlock,
  Eye,
} from "lucide-react";
import ComboboxMultiple from "@/components/ui/ComboboxMultiple";
import { saveImageFile } from "@/services/image.service";
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

// Remove explicit generic to allow inference
type FormValues = z.infer<typeof FormSchema>;

interface LugarCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { id: "basic", title: "The Essence", icon: Sparkles },
  { id: "location", title: "The Spot", icon: MapPin },
  { id: "vibe", title: "The Vibe", icon: Star },
  { id: "photos", title: "Memories", icon: ImageIcon },
];

const LugarCreateModal = ({ open, onOpenChange }: LugarCreateModalProps) => {
  const { addLugar, decryptedVault } = useVaultStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
    formState: { errors },
  } = form;
  const values = watch();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setStep(0);
      setDirection(0);
      setImageFiles([]);
      setImagePreviews([]);
      form.reset();
    }
  }, [open, form]);

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setDirection(1);
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (stepIndex: number): (keyof FormValues)[] => {
    switch (stepIndex) {
      case 0:
        return ["nombre", "description"];
      case 1:
        return ["direccion"]; // coordinates is optional but usually tied to address
      case 2:
        return ["privacy", "calidad", "precio"];
      case 3:
        return [];
      default:
        return [];
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // 1. Geocode if needed
      let coords = data.coordinates;
      if (!coords && data.direccion) {
        try {
          const fetchedCoords = await getCoordsFromName(data.direccion);
          if (fetchedCoords) {
            coords = { lat: fetchedCoords.lat, lon: fetchedCoords.lon };
          }
        } catch (err) {
          console.error("Geocoding failed", err);
          // Continue without coords
        }
      }

      // 2. Save Images
      const savedImageIds = await Promise.all(
        imageFiles.map((file) => saveImageFile(file)),
      );

      // 3. Create Lugar
      await addLugar({
        id: crypto.randomUUID(),
        ...data,
        coordinates: coords || undefined,
        fotos: savedImageIds,
        entradas: [],
        favorite: false,
      });

      toast.success("Lugar creado exitosamente");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al crear el lugar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col p-0 gap-0 bg-background">
        <DialogTitle className="sr-only">Nuevo Lugar</DialogTitle>
        <DialogDescription className="sr-only">
          Asistente para crear un nuevo lugar
        </DialogDescription>

        <div className="max-w-2xl w-full mx-auto h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                Nuevo Lugar
              </h2>
              <p className="text-muted-foreground">
                Añade un nuevo escenario a tu mapa de placer.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {steps.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-2 w-8 rounded-full transition-colors duration-300 ${i <= step ? "bg-pink-500" : "bg-slate-800"}`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-1 relative">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-6 py-4"
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-lg">
                        ¿Cómo se llama este lugar?
                      </Label>
                      <Input
                        id="nombre"
                        {...register("nombre")}
                        placeholder="Ej: El Nido de Amor, Hotel X, Mi Coche..."
                        className="text-xl p-6 bg-slate-900/50 border-slate-700 focus:border-pink-500 transition-all"
                        autoFocus
                      />
                      {errors.nombre && (
                        <p className="text-red-500 text-sm">
                          {errors.nombre && String(errors.nombre.message)}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-lg">
                        Describe la atmósfera
                      </Label>
                      <Textarea
                        id="description"
                        {...register("description")}
                        placeholder="¿Es romántico, salvaje, público, acogedor? Cuéntanos más..."
                        className="min-h-[150px] text-lg p-4 bg-slate-900/50 border-slate-700 focus:border-pink-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="direccion" className="text-lg">
                        ¿Dónde está ubicado?
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="direccion"
                          {...register("direccion")}
                          placeholder="Dirección o coordenadas..."
                          className="pl-12 text-xl p-6 bg-slate-900/50 border-slate-700 focus:border-pink-500 transition-all"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Intentaremos localizarlo en el mapa automáticamente.
                      </p>
                    </div>
                    {/* Placeholder for Map Component if we want to add it later */}
                    <div className="h-64 bg-slate-900/30 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                      <MapPin className="w-12 h-12 mb-2 opacity-20" />
                      <span className="sr-only">Mapa preview</span>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-lg">Nivel de Privacidad</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: "public", label: "Público", icon: Eye },
                          {
                            value: "semi-private",
                            label: "Semi",
                            icon: Unlock,
                          },
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
                      <Label className="text-lg">
                        Etiquetas (Calidad/Vibe)
                      </Label>
                      <ComboboxMultiple
                        options={(decryptedVault?.categories || []).map(
                          (c) => ({ label: c, value: c }),
                        )}
                        selectedValues={values.calidad || []}
                        onValueChange={(val) => setValue("calidad", val)}
                        placeholder="Selecciona etiquetas..."
                        label="Etiquetas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg">Rango de Precio</Label>
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
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label className="text-lg">Galería de Fotos</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((src, index) => (
                          <div
                            key={index}
                            className="relative aspect-square rounded-xl overflow-hidden group"
                          >
                            <img
                              src={src}
                              alt={`Preview ${index}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-500/5 transition-all">
                          <ImageIcon className="w-10 h-10 text-slate-500 mb-2" />
                          <span className="text-sm text-slate-500">
                            Añadir Foto
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-800">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 0 || isSubmitting}
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Atrás
            </Button>

            {step < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="bg-pink-600 hover:bg-pink-700 text-white px-8"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={handleSubmit(onSubmit as any)}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-700 hover:to-violet-700 text-white px-8"
              >
                {isSubmitting ? "Guardando..." : "Crear Lugar"}
                {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LugarCreateModal;
