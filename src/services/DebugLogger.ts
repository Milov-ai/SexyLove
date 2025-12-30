type LogLevel = "info" | "error" | "warn";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  private constructor() {}

  public static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  public log(message: string, data?: unknown) {
    this.addLog("info", message, data);
  }

  public error(message: string, error?: unknown) {
    this.addLog("error", message, error);
  }

  public warn(message: string, data?: unknown) {
    this.addLog("warn", message, data);
  }

  private addLog(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data: data ? this.sanitizeData(data) : undefined,
    };
    this.logs = [entry, ...this.logs].slice(0, 100); // Keep last 100
    this.notifyListeners();
  }

  private sanitizeData(data: unknown): unknown {
    try {
      if (data instanceof Error) {
        return {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      }
      // Basic circular dependency check/JSON cleaning
      return JSON.parse(JSON.stringify(data));
    } catch {
      return "[Unserializable Data]";
    }
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public clear() {
    this.logs = [];
    this.notifyListeners();
  }

  public subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.logs));
  }
}

export const logger = DebugLogger.getInstance();
