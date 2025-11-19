import { useState } from "react";
import { useVaultStore } from "@/store/vault.store";
import { Badge } from "@/components/ui/badge";
import ThemeSelector from "../components/common/ThemeSelector";

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
    <header className="fixed top-0 left-0 right-0 z-50 h-20 flex items-center justify-center glass border-b border-white/10 transition-all duration-300">
      <div className="inline-block relative group">
        <h1
          onClick={handleTitleClick}
          className="cursor-pointer text-5xl font-black tracking-tighter select-none bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-sm hover:scale-105 transition-transform duration-300"
        >
          Sex&Love
        </h1>
        {user && (
          <Badge className="absolute -bottom-2 -right-4 rotate-[-5deg] border-white/20 bg-gradient-to-r from-indigo-500 to-pink-500 shadow-lg animate-pulse">
            {user.username}
          </Badge>
        )}
      </div>
      <div className="absolute top-1/2 right-6 -translate-y-1/2">
        <ThemeSelector />
      </div>
    </header>
  );
};

export default Header;
