import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export type SyncActionType = "INSERT" | "UPDATE" | "DELETE";
export type TableName =
  | "lugares"
  | "entradas"
  | "wishlist"
  | "fantasies"
  | "tags"
  | "profiles";

/**
 * Represents a single action to be synchronized with the backend.
 */
export interface SyncAction {
  /** Unique identifier for the action */
  id: string;
  /** The type of operation (INSERT, UPDATE, DELETE) */
  type: SyncActionType;
  /** The target table name */
  table: TableName;
  /** The data payload associated with the action */
  payload: Record<string, unknown>;
  /** Timestamp when the action was created */
  timestamp: number;
  /** Number of times this action has been retried */
  retryCount: number;
}

const SYNC_QUEUE_KEY = "sexylove_sync_queue";

/**
 * Service responsible for handling offline synchronization.
 *
 * It maintains a queue of actions (INSERT, UPDATE, DELETE) in localStorage
 * and processes them when the application is online.
 *
 * @example
 * ```ts
 * // Add an action to the queue
 * await syncService.enqueue('INSERT', 'lugares', { name: 'New Place' });
 * ```
 */
class SyncService {
  private queue: SyncAction[] = [];
  private isSyncing = false;
  private online = navigator.onLine;

  constructor() {
    this.loadQueue();
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Try to sync immediately on load if online
    if (this.online) {
      this.processQueue();
    }
  }

  /**
   * Handles the 'online' event.
   * Sets the online flag to true and triggers queue processing.
   */
  private handleOnline = () => {
    this.online = true;
    console.log("App is online. Processing sync queue...");
    this.processQueue();
  };

  /**
   * Handles the 'offline' event.
   * Sets the online flag to false.
   */
  private handleOffline = () => {
    this.online = false;
    console.log("App is offline. Actions will be queued.");
  };

  /**
   * Loads the sync queue from localStorage.
   */
  private loadQueue() {
    const stored = localStorage.getItem(SYNC_QUEUE_KEY);
    if (stored) {
      try {
        this.queue = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse sync queue", e);
        this.queue = [];
      }
    }
  }

  /**
   * Saves the current sync queue to localStorage.
   */
  private saveQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
  }

  /**
   * Adds a new action to the sync queue.
   * If the app is online, it attempts to process the queue immediately.
   *
   * @param type - The type of action (INSERT, UPDATE, DELETE)
   * @param table - The target table name
   * @param payload - The data to be sent
   */
  public async enqueue(
    type: SyncActionType,
    table: TableName,
    payload: Record<string, unknown>,
  ) {
    const action: SyncAction = {
      id: uuidv4(),
      type,
      table,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.queue.push(action);
    this.saveQueue();

    if (this.online) {
      this.processQueue();
    }
  }

  /**
   * Processes the sync queue.
   * Iterates through the queue and performs each action sequentially.
   * If an action fails with a non-recoverable error (e.g., 409 Conflict), it is removed.
   */
  public async processQueue() {
    if (this.isSyncing || this.queue.length === 0 || !this.online) return;

    this.isSyncing = true;
    const queueCopy = [...this.queue]; // Work on a copy to handle failures properly

    for (const action of queueCopy) {
      try {
        await this.performAction(action);
        // If successful, remove from original queue
        this.queue = this.queue.filter((a) => a.id !== action.id);
        this.saveQueue();
      } catch (error: unknown) {
        console.error(`Failed to sync action ${action.id}`, error);

        const err = error as { code?: string; status?: number };
        // Handle 409 Conflict (Unique Violation) - '23505' is Postgres code for unique_violation
        if (err.code === "23505" || err.status === 409) {
          console.warn(
            `Duplicate entry detected for action ${action.id}, removing from queue.`,
          );
          this.queue = this.queue.filter((a) => a.id !== action.id);
          this.saveQueue();
          continue; // Continue processing other actions
        }

        // If it's a permanent error (e.g. 400 Bad Request), maybe we should drop it?
        // For now, we just leave it in the queue and increment retry count?
        // Or we move it to a "dead letter queue"?
        // Let's just stop processing for now to avoid out-of-order issues if dependent.
        this.isSyncing = false;
        return;
      }
    }

    this.isSyncing = false;
  }

  /**
   * Performs a single sync action against the Supabase API.
   * Handles payload sanitization and query execution.
   *
   * @param action - The action to perform
   * @throws Error if the action fails
   */
  private async performAction(action: SyncAction) {
    const { type, table, payload } = action;

    // Sanitize payload to fix schema mismatches (e.g. persisted actions with old field names)
    const sanitize = (data: Record<string, unknown>) => {
      if (!data) return;
      if (data.createdAt) {
        data.created_at = data.createdAt;
        delete data.createdAt;
      }
      if (data.createdBy) {
        data.created_by = data.createdBy;
        delete data.createdBy;
      }
      if (data.locationId) {
        data.location_id = data.locationId;
        delete data.locationId;
      }
      if (data.referenceImage) {
        data.reference_image = data.referenceImage;
        delete data.referenceImage;
      }
      // Validate created_by is a UUID (fix for "Milov" error)
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (data.created_by && !uuidRegex.test(data.created_by as string)) {
        delete data.created_by;
      }
    };

    if (type === "INSERT") {
      sanitize(payload);
    } else if (type === "UPDATE") {
      if (payload.update) {
        sanitize(payload.update as Record<string, unknown>);
      } else {
        sanitize(payload);
      }
    }

    let query;

    if (type === "INSERT") {
      // Inject created_by if missing and user is authenticated (fixes stuck actions)
      // BUT only for tables that actually have this column
      const tablesWithCreatedBy: TableName[] = [
        "lugares",
        "entradas",
        "wishlist",
        "fantasies",
      ];

      if (tablesWithCreatedBy.includes(table) && !payload.created_by) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          payload.created_by = user.id;
        }
      }

      // Sanitize payload for tags table (remove created_by if it got stuck there)
      if (table === "tags" && payload.created_by) {
        delete payload.created_by;
      }

      // Sanitize payload for lugares table (remove entradas relationship)
      if (table === "lugares") {
        delete payload.entradas;
        // Ensure coordinates are formatted correctly if they are objects
        if (payload.coordinates) {
          if (typeof payload.coordinates === "object") {
            const coords = payload.coordinates as { lon: number; lat: number };
            if (
              typeof coords.lon === "number" &&
              typeof coords.lat === "number" &&
              !isNaN(coords.lon) &&
              !isNaN(coords.lat)
            ) {
              payload.coordinates = `(${coords.lon},${coords.lat})`;
            } else {
              delete payload.coordinates;
            }
          } else if (
            typeof payload.coordinates === "string" &&
            payload.coordinates === "(undefined,undefined)"
          ) {
            delete payload.coordinates;
          }
        }
      }

      query = supabase.from(table).insert(payload);
    } else if (type === "UPDATE") {
      // Check if payload has match criteria (for tags)
      if (payload.match && payload.update) {
        query = supabase
          .from(table)
          .update(payload.update)
          .match(payload.match);
      } else {
        // Standard update by ID
        const { id, ...updates } = payload;
        if (!id) throw new Error("Update action requires an ID in payload");

        // Sanitize payload for lugares table (remove entradas relationship)
        if (table === "lugares") {
          delete updates.entradas;
          if (updates.coordinates) {
            if (typeof updates.coordinates === "object") {
              const coords = updates.coordinates as {
                lon: number;
                lat: number;
              };
              if (
                typeof coords.lon === "number" &&
                typeof coords.lat === "number" &&
                !isNaN(coords.lon) &&
                !isNaN(coords.lat)
              ) {
                updates.coordinates = `(${coords.lon},${coords.lat})`;
              } else {
                delete updates.coordinates;
              }
            } else if (
              typeof updates.coordinates === "string" &&
              updates.coordinates === "(undefined,undefined)"
            ) {
              delete updates.coordinates;
            }
          }
        }

        query = supabase.from(table).update(updates).eq("id", id);
      }
    } else if (type === "DELETE") {
      // Check if payload is an object with match (for tags)
      if (typeof payload === "object" && payload.match) {
        query = supabase.from(table).delete().match(payload.match);
      } else {
        // Standard delete by ID
        const id = typeof payload === "string" ? payload : payload.id;
        if (!id) throw new Error("Delete action requires an ID");
        query = supabase.from(table).delete().eq("id", id);
      }
    } else {
      throw new Error(`Unknown action type: ${type}`);
    }

    const { error } = await query;
    if (error) throw error;
  }
}

export const syncService = new SyncService();
