import { useEffect, useState } from "react";
import { logger } from "@/services/DebugLogger";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bug, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const DebugLoggerUI = () => {
  const [logs, setLogs] = useState(logger.getLogs());

  useEffect(() => {
    return logger.subscribe(setLogs);
  }, []);

  const copyLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.data ? JSON.stringify(l.data, null, 2) : ""}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Logs copiados al portapapeles");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 z-50 rounded-full h-12 w-12 bg-black/50 backdrop-blur-md border-white/10 shadow-xl opacity-50 hover:opacity-100"
        >
          <Bug className="h-6 w-6 text-red-500" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[80vh] bg-zinc-950 border-white/10 text-white rounded-t-3xl"
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
          <div className="flex flex-col text-left">
            <SheetTitle className="text-white flex items-center gap-2">
              <Bug className="h-5 w-5 text-red-500" />
              Consola de Depuración
            </SheetTitle>
            <SheetDescription className="text-zinc-500">
              Captura de errores y eventos en tiempo real
            </SheetDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => logger.clear()}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={copyLogs}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="h-full mt-4 pb-20">
          <div className="space-y-2 font-mono text-[10px]">
            {logs.length === 0 ? (
              <p className="text-zinc-500 text-center py-10 italic">
                No hay logs registrados
              </p>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`p-2 rounded border ${
                    log.level === "error"
                      ? "bg-red-500/10 border-red-500/20 text-red-200"
                      : log.level === "warn"
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-200"
                        : "bg-white/5 border-white/5 text-zinc-300"
                  }`}
                >
                  <div className="flex justify-between opacity-50 mb-1">
                    <span>{log.timestamp}</span>
                    <span className="uppercase">{log.level}</span>
                  </div>
                  <div className="break-words font-bold">{log.message}</div>
                  {log.data && (
                    <pre className="mt-1 overflow-x-auto p-1 bg-black/30 rounded text-[9px]">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
