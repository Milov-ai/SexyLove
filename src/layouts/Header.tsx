import { useState } from "react";
import { useVaultStore } from "@/store/vault.store";
import { Badge } from "@/components/ui/badge";
import ThemeSelector from "../components/common/ThemeSelector";
import { BrandLogo } from "@/components/common/BrandLogo";

const Header = () => {
  const { user, lockVault } = useVaultStore();
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
      lockVault();
      setClickCount(0);
    }
  };

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-6rem)] md:w-[calc(100%-10rem)] lg:w-[calc(100%-12rem)] max-w-7xl z-50 h-14 md:h-16 flex items-center justify-between px-6 md:px-8 rounded-full glass-dirty border border-white/10 shadow-3xl transition-all duration-500 backdrop-blur-3xl bg-white/5 dark:bg-black/30">
      <div className="flex items-center gap-4 group">
        <div
          onClick={handleTitleClick}
          className="cursor-pointer flex items-center gap-2 select-none"
        >
          <BrandLogo size={20} />
          <h1 className="text-lg md:text-2xl font-black tracking-tighter text-foreground group-hover:scale-105 transition-transform duration-300">
            Sex<span className="text-neon-primary">&</span>Love
          </h1>
        </div>
        {user && (
          <Badge className="rotate-[-5deg] border-neon-primary/30 bg-gradient-to-r from-neon-primary to-neon-secondary text-white shadow-neon animate-pulse pointer-events-none hidden md:flex">
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
