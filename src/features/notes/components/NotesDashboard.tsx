import { useState, useEffect } from "react";
import { useNotesStore } from "@/store/notes.store";

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
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import AuthScreen from "@/features/auth/components/AuthScreen";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import NoteEditor from "./NoteEditor";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

const NotesDashboard = () => {
  const {
    folders,
    notes,
    initialize,
    addFolder,
    addNote,
    deleteNote,
    deleteFolder,
  } = useNotesStore();

  // UI State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Auth Trigger State
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    initialize();
  }, [initialize]);

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
    await addFolder({
      name: newFolderName,
      parent_id: currentFolderId,
      color: "bg-slate-800",
      icon: "folder",
    });
    setNewFolderName("");
    setIsCreateOpen(false);
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

  if (showAuthScreen) {
    return <AuthScreen open={true} onOpenChange={setShowAuthScreen} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-pink-500/30">
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 pt-safe-top">
        <div className="px-6 py-4 flex items-center justify-between">
          <div
            onClick={handleTitleClick}
            className="cursor-pointer select-none"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Pide un deseo ✨
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-full"
            >
              {viewMode === "grid" ? (
                <ListIcon size={20} />
              ) : (
                <Grid size={20} />
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
              className="text-slate-400 hover:text-white pl-0 gap-1"
            >
              <ChevronLeft size={16} />
              Atrás
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
              onClick={() => setCurrentFolderId(folder.id)}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/60 hover:border-violet-500/30 transition-all cursor-pointer flex flex-col justify-between h-32`}
            >
              <div className="flex items-start justify-between">
                <FolderIcon className="text-violet-500" size={24} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 -mt-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({
                      type: "folder",
                      id: folder.id,
                      name: folder.name,
                    });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
              <span className="font-medium text-slate-200 truncate">
                {folder.name}
              </span>
            </motion.div>
          ))}

          {/* Notes */}
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              onClick={() => setSelectedNoteId(note.id)}
              className={`group relative overflow-hidden rounded-2xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-sm p-4 hover:bg-slate-800/60 hover:border-pink-500/30 transition-all cursor-pointer flex flex-col justify-between h-32`}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200 mb-2 truncate">
                  {note.title || "Sin título"}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {note.content.includes('"type":"text"')
                    ? "Texto..."
                    : "Nota..."}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-xs text-slate-600">
                  {format(new Date(note.updated_at), "MMM d")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget({
                      type: "note",
                      id: note.id,
                      name: note.title || "Sin título",
                    });
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
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
                    disabled={!newFolderName.trim()}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default NotesDashboard;
