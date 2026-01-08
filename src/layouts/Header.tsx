import { useState } from "react";
import { useVaultStore } from "@/store/vault.store";
import { Badge } from "@/components/ui/badge";
import ThemeSelector from "../components/common/ThemeSelector";
import { BrandLogo } from "@/components/common/BrandLogo";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, lockVault, isLocked } = useVaultStore();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleTitleClick = () => {
    const now = Date.now();
    if (now - lastClickTime > 500) {
      setClickCount(1);
    } else {
      setClickCount(clickCount + 1);
    }
    setLastClickTime(now);

    if (clickCount + 1 >= 3) {
      console.log("[Header] 3-Click: Locking Vault Silently");
      lockVault(true); // Silent lock
      setClickCount(0);
    }
  };

  // Vault Theme Logic
  const isVaultMode = !isLocked;
  const containerClasses = isVaultMode
    ? "bg-black/90 border-violet-500/50 shadow-[0_0_25px_rgba(139,92,246,0.3)] backdrop-blur-3xl"
    : "glass-dirty border-white/10 shadow-3xl bg-white/5 dark:bg-black/30";

  const textClasses = isVaultMode ? "text-white" : "text-foreground";
  const logoClasses = isVaultMode ? "text-violet-500" : "text-neon-primary";
  const badgeClasses = isVaultMode
    ? "border-violet-500/50 bg-violet-900/50 text-violet-100 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
    : "border-neon-primary/30 bg-gradient-to-r from-neon-primary to-neon-secondary text-white shadow-neon";

  return (
    <header
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-6rem)] md:w-[calc(100%-10rem)] lg:w-[calc(100%-12rem)] max-w-7xl z-50 h-14 md:h-16 flex items-center justify-between px-6 md:px-8 rounded-full transition-all duration-500",
        containerClasses,
      )}
    >
      <div className="flex items-center gap-4 group">
        <div
          onClick={handleTitleClick}
          className="cursor-pointer flex items-center gap-2 select-none"
        >
          <BrandLogo size={20} className={logoClasses} />
          <h1
            className={cn(
              "text-lg md:text-2xl font-black tracking-tighter group-hover:scale-105 transition-transform duration-300",
              textClasses,
            )}
          >
            Sex
            <span
              className={isVaultMode ? "text-violet-500" : "text-neon-primary"}
            >
              &
            </span>
            Love
          </h1>
        </div>
        {user && (
          <Badge
            className={cn(
              "rotate-[-5deg] animate-pulse pointer-events-none hidden md:flex",
              badgeClasses,
            )}
          >
            {user.username}
          </Badge>
        )}
      </div>
      <div>
        <ThemeSelector />
      </div>
    </header>
  );
};

export default Header;
