import { useState, useEffect } from "react";
import { useNotesStore, type Folder } from "@/store/notes.store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Grid,
  List as ListIcon,
  Trash2,
  FolderPlus,
  FilePlus,
  ChevronRight,
  ChevronLeft,
  Folder as FolderIcon,
  Sparkles,
} from "lucide-react";
import { App } from "@capacitor/app";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AuthScreen from "@/features/auth/components/AuthScreen";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NoteEditor from "./NoteEditor";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { LockScreen } from "./LockScreen";
import { Lock, MoreVertical } from "lucide-react";
import CryptoJS from "crypto-js";
import { THEMES, type ThemeId } from "@/lib/theme-constants";
import { ColorPicker } from "@/components/ui/ColorPicker";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const NotesDashboard = () => {
  const {
    folders,
    notes,
    initialize,
    addFolder,
    updateFolder,
    addNote,
    updateNote,
    deleteNote,
    deleteFolder,
    unlockedFolderIds,
    unlockFolder,
  } = useNotesStore();

  // UI State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("default");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Lock Screen State
  const [lockScreenOpen, setLockScreenOpen] = useState(false);
  const [pendingFolderId, setPendingFolderId] = useState<string | null>(null);

  // Auth Trigger State
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Hardware Back Button Handling
  useEffect(() => {
    const handleBackButton = async () => {
      if (selectedNoteId) {
        setSelectedNoteId(null);
      } else if (currentFolderId) {
        // Navigate up one level
        const parentId = folders.find(
          (f) => f.id === currentFolderId,
        )?.parent_id;
        setCurrentFolderId(parentId || null);
      } else {
        // Exit app if at root
        App.exitApp();
      }
    };

    const listener = App.addListener("backButton", handleBackButton);

    return () => {
      listener.then((l) => l.remove());
    };
  }, [currentFolderId, selectedNoteId, folders]);

  // Navigation Logic
  const currentFolder = folders.find((f) => f.id === currentFolderId);

  const filteredFolders = folders.filter(
    (f) => f.parent_id === currentFolderId,
  );
  const filteredNotes = notes.filter(
    (n) =>
      n.folder_id === currentFolderId &&
      (n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Handlers
  const handleCreateNote = async () => {
    const newNoteId = await addNote({
      title: "",
      content: JSON.stringify([
        { id: crypto.randomUUID(), type: "text", content: "" },
      ]),
      folder_id: currentFolderId,
      is_pinned: false,
      color: "bg-slate-900",
    });
    setIsCreateOpen(false);
    setSelectedNoteId(newNoteId);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    let lockData = {};
    if (isPrivate && newPin.length === 4) {
      lockData = {
        is_locked: true,
        lock_code: CryptoJS.SHA256(newPin).toString(),
      };
    }

    await addFolder({
      name: newFolderName,
      parent_id: currentFolderId,
      color: selectedColor,
      ...lockData,
    });
    setNewFolderName("");
    setIsPrivate(false);
    setNewPin("");
    setSelectedColor("default");
    setIsCreateOpen(false);
  };

  const handleFolderClick = (folder: Folder) => {
    if (folder.is_locked && !unlockedFolderIds.includes(folder.id)) {
      setPendingFolderId(folder.id);
      setLockScreenOpen(true);
    } else {
      setCurrentFolderId(folder.id);
    }
  };

  const handleUnlock = () => {
    if (pendingFolderId) {
      unlockFolder(pendingFolderId);
      setCurrentFolderId(pendingFolderId);
      setLockScreenOpen(false);
      setPendingFolderId(null);
    }
  };

  const handleTitleClick = () => {
    const now = Date.now();
    if (now - lastClickTime < 500) {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      if (newCount >= 3) {
        setShowAuthScreen(true);
        setClickCount(0);
      }
    } else {
      setClickCount(1);
    }
    setLastClickTime(now);
  };

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "folder" | "note";
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "folder") {
      await deleteFolder(deleteTarget.id);
    } else {
      await deleteNote(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  // Edit Aura State
  const [isEditAuraOpen, setIsEditAuraOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<{
    id: string;
    type: "folder" | "note";
    color: string;
  } | null>(null);

  const handleEditAura = (item: {
    id: string;
    type: "folder" | "note";
    color: string;
  }) => {
    setItemToEdit(item);
    setSelectedColor(item.color);
    setIsEditAuraOpen(true);
  };

  const saveAura = async () => {
    if (!itemToEdit) return;

    if (itemToEdit.type === "folder") {
      await updateFolder(itemToEdit.id, { color: selectedColor });
    } else {
      await updateNote(itemToEdit.id, { color: selectedColor });
    }

    setIsEditAuraOpen(false);
    setItemToEdit(null);
    setSelectedColor("default");
  };

  // Security State
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [securityMode, setSecurityMode] = useState<"lock" | "unlock">("lock");
  const [securityTarget, setSecurityTarget] = useState<Folder | null>(null);
  const [securityPin, setSecurityPin] = useState("");

  const handleSecurityAction = (folder: Folder) => {
    setSecurityTarget(folder);
    setSecurityMode(folder.is_locked ? "unlock" : "lock");
    setSecurityPin("");
    setIsSecurityOpen(true);
  };

  const handleSecuritySubmit = async () => {
    if (!securityTarget || securityPin.length !== 4) return;

    const hashedPin = CryptoJS.SHA256(securityPin).toString();

    if (securityMode === "lock") {
      await updateFolder(securityTarget.id, {
        is_locked: true,
        lock_code: hashedPin,
      });
    } else {
      // Verify PIN for unlock
      if (hashedPin !== securityTarget.lock_code) {
        toast.error("PIN Incorrecto");
        setSecurityPin("");
        return;
      }
      await updateFolder(securityTarget.id, {
        is_locked: false,
        lock_code: null,
      });
    }

    setIsSecurityOpen(false);
    setSecurityTarget(null);
    setSecurityPin("");
  };

  const handleSecureDelete = (folder: Folder) => {
    if (folder.is_locked) {
      // If locked, require unlock first (or specific delete verification)
      // For simplicity, we'll use the unlock flow but with a "delete" intent context if needed.
      // Or just ask to unlock first.
      toast.error("Desbloquea la carpeta primero para eliminarla.");
      return;
    }
    setDeleteTarget({
      type: "folder",
      id: folder.id,
      name: folder.name,
    });
  };

  if (showAuthScreen) {
    return <AuthScreen open={true} onOpenChange={setShowAuthScreen} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      <AnimatePresence>
        {selectedNoteId && (
          <NoteEditor
            noteId={selectedNoteId}
            onClose={() => setSelectedNoteId(null)}
          />
        )}
      </AnimatePresence>

      <DeleteConfirmationDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={`¿Eliminar ${deleteTarget?.type === "folder" ? "carpeta" : "nota"}?`}
        description={`Estás a punto de eliminar "${deleteTarget?.name}". ${deleteTarget?.type === "folder" ? "Todo su contenido también será eliminado." : ""} Esta acción es irreversible.`}
      />

      <LockScreen
        isOpen={lockScreenOpen}
        onUnlock={handleUnlock}
        lockCode={
          folders.find((f) => f.id === pendingFolderId)?.lock_code || null
        }
        onCancel={() => {
          setLockScreenOpen(false);
          setPendingFolderId(null);
        }}
      />

      <Sheet open={isEditAuraOpen} onOpenChange={setIsEditAuraOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[32px] border-t border-white/10 bg-slate-950/95 backdrop-blur-xl p-6 pb-10"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-serif font-medium text-white">
              Cambiar Aura
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Selecciona una energía
              </Label>
              <ColorPicker
                selectedColor={selectedColor}
                onSelect={setSelectedColor}
              />
            </div>

            <Button
              onClick={saveAura}
              className="w-full h-14 rounded-2xl bg-white text-black font-medium text-lg hover:bg-slate-200 transition-colors"
            >
              Guardar Cambios
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Header */}
      <header className="sticky top-0 z-40 pt-safe-top transition-all duration-300">
        {/* Seamless Background - Matches body, no border */}
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm" />

        {/* CLEAN BACKGROUND - No decorative elements */}

        <div className="relative px-6 pt-12 pb-2 md:pt-16 md:pb-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div
            onClick={handleTitleClick}
            className="cursor-pointer select-none group relative"
          >
            {/* Logo Container */}
            <h1 className="relative text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm flex items-center gap-4">
              <span className="font-sans text-slate-200 group-hover:text-white transition-colors tracking-tighter">
                Pide un
              </span>

              <div className="relative px-4 py-1">
                {/* Rounded Pill Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 rounded-full blur-md" />
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-full border border-white/5" />

                <span className="font-serif italic bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent text-neon animate-shimmer bg-[length:200%_auto] relative z-10">
                  Deseo
                </span>
              </div>

              {/* Star - Subtle, no float */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-yellow-400/20 blur-lg rounded-full animate-pulse-glow" />
                <span className="relative z-10">
                  <Sparkles
                    className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]"
                    size={32}
                    strokeWidth={2.5}
                  />
                </span>
              </div>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-full w-12 h-12 transition-all hover:scale-105"
            >
              {viewMode === "grid" ? (
                <ListIcon size={24} />
              ) : (
                <Grid size={24} />
              )}
            </Button>
          </div>
        </div>

        {/* Breadcrumb / Navigation */}
        <div className="px-6 pb-4 flex items-center gap-2 overflow-x-auto">
          {currentFolderId ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentFolderId(currentFolder?.parent_id || null)
              }
              className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-1.5 h-auto rounded-full backdrop-blur-md border border-white/10 transition-all hover:scale-105 flex items-center gap-1.5 group"
            >
              <ChevronLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              <span className="text-sm font-medium">Atrás</span>
            </Button>
          ) : (
            <span className="text-sm font-medium text-slate-500">Inicio</span>
          )}
          {currentFolder && (
            <>
              <span className="text-slate-600">/</span>
              <span className="text-sm font-medium text-slate-200">
                {currentFolder.name}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 pb-24 max-w-7xl mx-auto">
        {/* Search */}
        <div className="mb-6 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            size={18}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="h-12 w-full bg-slate-900 border-slate-800 rounded-2xl pl-12 text-base focus:border-pink-500/50 focus:ring-pink-500/20"
          />
        </div>

        {/* Content Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {/* Folders */}
          {filteredFolders.map((folder) => (
            <motion.div
              key={folder.id}
              layout
              onClick={() => handleFolderClick(folder)}
              className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm p-4 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                THEMES[folder.color as ThemeId]?.bg || THEMES.default.bg
              } ${
                THEMES[folder.color as ThemeId]?.border || THEMES.default.border
              } hover:bg-slate-800/60 hover:border-violet-500/30`}
              style={{
                boxShadow: THEMES[folder.color as ThemeId]?.glow
                  ? `0 0 20px -5px ${THEMES[folder.color as ThemeId].glow.match(/rgba\(([^)]+)\)/)?.[1] || "transparent"}`
                  : "none",
              }}
            >
              {/* Glow Effect */}
              <div
                className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${THEMES[folder.color as ThemeId]?.bg || THEMES.default.bg}`}
              />

              <div className="flex flex-col justify-between h-full relative z-10">
                {/* Top: Icon & Name */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 flex-shrink-0 ${THEMES[folder.color as ThemeId]?.icon || THEMES.default.icon}`}
                  >
                    {folder.is_locked ? (
                      <Lock size={20} />
                    ) : (
                      <FolderIcon size={20} />
                    )}
                  </div>
                  <span className="font-medium text-lg tracking-tight text-white/90 line-clamp-2 leading-tight pt-1">
                    {folder.name}
                  </span>
                </div>

                {/* Bottom: Actions */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 -ml-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors outline-none"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-48 bg-slate-900 border-slate-800 text-slate-200"
                    >
                      <DropdownMenuLabel>Opciones</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-slate-800" />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAura({
                            id: folder.id,
                            type: "folder",
                            color: folder.color,
                          });
                        }}
                        className="gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
                      >
                        <Sparkles size={14} />
                        <span>Cambiar Aura</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSecurityAction(folder);
                        }}
                        className="gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
                      >
                        {folder.is_locked ? (
                          <Lock size={14} className="text-pink-500" />
                        ) : (
                          <Lock size={14} />
                        )}
                        <span>
                          {folder.is_locked ? "Desbloquear" : "Bloquear"}
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mr-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSecureDelete(folder);
                    }}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Notes */}
          {filteredNotes.map((note) => {
            const getNotePreview = (content: string) => {
              try {
                const blocks = JSON.parse(content);
                if (!Array.isArray(blocks) || blocks.length === 0)
                  return "Nota vacía";

                const firstContentBlock = blocks.find(
                  (b) => b.content && b.content.trim().length > 0,
                );

                if (!firstContentBlock) return "Nota vacía";

                if (firstContentBlock.type === "image") return "📷 Imagen";
                if (firstContentBlock.type === "table") return "📊 Tabla";

                // For text-based blocks
                return firstContentBlock.content.slice(0, 100);
              } catch {
                return "Nota...";
              }
            };

            return (
              <motion.div
                key={note.id}
                layout
                onClick={() => setSelectedNoteId(note.id)}
                className={`group relative overflow-hidden rounded-2xl border backdrop-blur-sm p-4 transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                  THEMES[note.color as ThemeId]?.bg || THEMES.default.bg
                } ${
                  THEMES[note.color as ThemeId]?.border || THEMES.default.border
                } hover:shadow-lg hover:scale-[1.02]`}
              >
                <div className="flex flex-col justify-between h-full relative z-10">
                  {/* Top: Title & Preview */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg text-white/90 line-clamp-2 leading-tight mb-2">
                      {note.title || "Sin título"}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 whitespace-pre-wrap break-words">
                      {getNotePreview(note.content)}
                    </p>
                  </div>

                  {/* Bottom: Meta & Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider font-medium text-slate-600">
                        {format(new Date(note.updated_at), "MMM d")}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAura({
                            id: note.id,
                            type: "note",
                            color: note.color,
                          });
                        }}
                        className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 -mr-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({
                          type: "note",
                          id: note.id,
                          name: note.title || "Nota sin título",
                        });
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredFolders.length === 0 && filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4">
              <FolderPlus size={32} className="opacity-50" />
            </div>
            <p className="text-lg font-medium">Carpeta vacía</p>
            <p className="text-sm">Agrega notas o subcarpetas</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {!selectedNoteId && (
        <div className="fixed bottom-6 right-6 z-50">
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-600 to-violet-600 text-white shadow-lg shadow-pink-500/40 flex items-center justify-center"
              >
                <Plus size={28} />
              </motion.button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="bg-slate-950 border-t border-slate-800 rounded-t-[2rem] p-6 pb-10"
            >
              <SheetTitle className="text-lg font-semibold text-center text-slate-200 mb-2">
                Crear Nuevo
              </SheetTitle>
              <SheetDescription className="text-center text-slate-500 mb-4">
                ¿Qué deseas agregar aquí?
              </SheetDescription>

              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCreateNote}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-pink-500/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <FilePlus size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-200">Nueva Nota</p>
                    <p className="text-sm text-slate-500">
                      Crear archivo con bloques
                    </p>
                  </div>
                  <ChevronRight className="ml-auto text-slate-600" />
                </button>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-400 ml-1">
                    Nueva Carpeta
                  </p>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nombre de la carpeta..."
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="bg-slate-900 border-slate-800 focus:border-violet-500 h-12"
                      />
                      <Button
                        onClick={handleCreateFolder}
                        className="h-12 w-12 bg-violet-600 hover:bg-violet-700"
                        disabled={
                          !newFolderName.trim() ||
                          (isPrivate && newPin.length !== 4)
                        }
                      >
                        <Plus />
                      </Button>
                    </div>

                    <div className="space-y-2 px-1">
                      <Label className="text-xs font-medium text-slate-400">
                        Aura (Color & Mood)
                      </Label>
                      <ColorPicker
                        selectedColor={selectedColor}
                        onSelect={setSelectedColor}
                      />
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <button
                        onClick={() => setIsPrivate(!isPrivate)}
                        className={`text-xs flex items-center gap-1.5 transition-colors ${isPrivate ? "text-pink-500 font-medium" : "text-slate-500 hover:text-slate-400"}`}
                      >
                        <Lock size={12} />
                        {isPrivate ? "Carpeta Privada" : "Hacer Privada"}
                      </button>
                    </div>

                    <AnimatePresence>
                      {isPrivate && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <Input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="PIN de 4 dígitos"
                            value={newPin}
                            onChange={(e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 4);
                              setNewPin(val);
                            }}
                            className="bg-slate-900/50 border-pink-500/30 focus:border-pink-500 h-10 text-center tracking-[0.5em] font-mono text-lg"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Security Sheet */}
          <Sheet open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
            <SheetContent
              side="bottom"
              className="rounded-t-[32px] border-t border-white/10 bg-slate-950/95 backdrop-blur-xl p-6 pb-10"
            >
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-serif font-medium text-white">
                  {securityMode === "lock"
                    ? "Bloquear Carpeta"
                    : "Desbloquear Carpeta"}
                </SheetTitle>
                <SheetDescription className="text-slate-400">
                  {securityMode === "lock"
                    ? "Crea un PIN de 4 dígitos para proteger esta carpeta."
                    : "Ingresa el PIN para acceder a esta carpeta."}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                <div className="flex justify-center py-4">
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="• • • •"
                    value={securityPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setSecurityPin(val);
                    }}
                    className="bg-slate-900/50 border-pink-500/30 focus:border-pink-500 h-16 w-64 text-center tracking-[0.3em] font-mono text-3xl rounded-2xl"
                  />
                </div>

                <Button
                  onClick={handleSecuritySubmit}
                  disabled={securityPin.length !== 4}
                  className="w-full h-14 rounded-2xl bg-white text-black font-medium text-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  {securityMode === "lock" ? "Proteger" : "Desbloquear"}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
};

export default NotesDashboard;
