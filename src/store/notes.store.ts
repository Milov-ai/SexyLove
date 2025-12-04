import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// --- Types ---
export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  content: string; // JSON string of Block[]
  is_pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  is_locked?: boolean;
  lock_code?: string | null;
}

export type BlockType =
  | "text"
  | "heading"
  | "todo"
  | "image"
  | "bullet"
  | "table";

export interface BlockStyle {
  fontFamily?: "sans" | "serif" | "mono";
  textAlign?: "left" | "center" | "right" | "justify";
  fontSize?: "sm" | "base" | "lg" | "xl" | "2xl";
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  isCompleted?: boolean; // For todos
  reminder?: string | null; // ISO date string
  props?: Record<string, unknown>; // For additional properties (e.g. heading level, table data)
  style?: BlockStyle;
}

export interface Note {
  id: string;
  folder_id: string | null;
  title: string;
  content: string; // JSON string of Block[]
  is_pinned: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

// Legacy Todo support (can be deprecated or kept for backward compatibility)
export interface Todo {
  id: string;
  note_id: string | null;
  text: string;
  is_completed: boolean;
  due_date: string | null;
  reminder_at: string | null;
}

export interface Media {
  id: string;
  note_id: string;
  url: string;
  type: "image" | "video" | "audio";
}

interface NotesState {
  folders: Folder[];
  notes: Note[];
  todos: Todo[];
  media: Media[];
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  sync: () => Promise<void>;

  addFolder: (folder: Partial<Folder>) => Promise<string>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;

  addNote: (note: Partial<Note>) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  addTodo: (todo: Partial<Todo>) => Promise<string>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;

  addMedia: (media: Partial<Media>) => Promise<string>;
  deleteMedia: (id: string) => Promise<void>;

  // Private Folders
  unlockedFolderIds: string[];
  unlockFolder: (id: string) => void;
  lockFolder: (id: string) => void;
}

// --- Store ---
export const useNotesStore = create<NotesState>((set, get) => ({
  folders: [],
  notes: [],
  todos: [],
  media: [],
  isLoading: true,

  initialize: async () => {
    await get().sync();

    // Realtime Subscription
    supabase
      .channel("notes-system")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        () => get().sync(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes" },
        () => get().sync(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "todos" },
        () => get().sync(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "media" },
        () => get().sync(),
      )
      .subscribe();
  },

  sync: async () => {
    set({ isLoading: true });
    const [folders, notes, todos, media] = await Promise.all([
      supabase.from("folders").select("*"),
      supabase.from("notes").select("*"),
      supabase.from("todos").select("*"),
      supabase.from("media").select("*"),
    ]);

    set({
      folders: folders.data || [],
      notes: notes.data || [],
      todos: todos.data || [],
      media: media.data || [],
      isLoading: false,
    });
  },

  addFolder: async (folder) => {
    const id = uuidv4();
    const newFolder = { ...folder, id };
    // Optimistic Update
    set((state) => ({ folders: [...state.folders, newFolder as Folder] }));
    await supabase.from("folders").insert(newFolder);
    return id;
  },

  updateFolder: async (id, updates) => {
    set((state) => ({
      folders: state.folders.map((f) =>
        f.id === id ? { ...f, ...updates } : f,
      ),
    }));
    await supabase.from("folders").update(updates).eq("id", id);
  },

  deleteFolder: async (id) => {
    set((state) => ({ folders: state.folders.filter((f) => f.id !== id) }));
    await supabase.from("folders").delete().eq("id", id);
  },

  addNote: async (note) => {
    const id = uuidv4();
    const newNote = { ...note, id, updated_at: new Date().toISOString() };
    set((state) => ({ notes: [...state.notes, newNote as Note] }));
    await supabase.from("notes").insert(newNote);
    return id;
  },

  updateNote: async (id, updates) => {
    const newUpdates = { ...updates, updated_at: new Date().toISOString() };
    set((state) => ({
      notes: state.notes.map((n) =>
        n.id === id ? { ...n, ...newUpdates } : n,
      ),
    }));
    await supabase.from("notes").update(newUpdates).eq("id", id);
  },

  deleteNote: async (id) => {
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }));
    await supabase.from("notes").delete().eq("id", id);
  },

  addTodo: async (todo) => {
    const id = uuidv4();
    const newTodo = { ...todo, id };
    set((state) => ({ todos: [...state.todos, newTodo as Todo] }));
    await supabase.from("todos").insert(newTodo);
    return id;
  },

  toggleTodo: async (id) => {
    const todo = get().todos.find((t) => t.id === id);
    if (!todo) return;
    const updates = { is_completed: !todo.is_completed };

    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
    await supabase.from("todos").update(updates).eq("id", id);
  },

  deleteTodo: async (id) => {
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) }));
    await supabase.from("todos").delete().eq("id", id);
  },

  addMedia: async (media) => {
    const id = uuidv4();
    const newMedia = { ...media, id };
    set((state) => ({ media: [...state.media, newMedia as Media] }));
    await supabase.from("media").insert(newMedia);
    return id;
  },

  deleteMedia: async (id) => {
    set((state) => ({ media: state.media.filter((m) => m.id !== id) }));
    await supabase.from("media").delete().eq("id", id);
  },

  // Private Folders
  unlockedFolderIds: [],
  unlockFolder: (id) => {
    set((state) => ({
      unlockedFolderIds: [...state.unlockedFolderIds, id],
    }));
  },
  lockFolder: (id) => {
    set((state) => ({
      unlockedFolderIds: state.unlockedFolderIds.filter((fid) => fid !== id),
    }));
  },
}));
