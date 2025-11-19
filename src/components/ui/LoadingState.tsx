import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Cargando..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      <p className="text-sm text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingState;
