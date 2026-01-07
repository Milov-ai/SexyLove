import { useTheme } from "@/context/theme.context";
import { MoonIcon, SunIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleCheckedChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="inline-flex items-center gap-2 bg-white/5 dark:bg-black/20 p-1 pl-3 rounded-full border border-white/10 backdrop-blur-md">
      <div className="flex items-center justify-center">
        {theme === "dark" ? (
          <MoonIcon
            className="size-4 text-neon-primary drop-shadow-neon"
            aria-hidden="true"
          />
        ) : (
          <SunIcon
            className="size-4 text-amber-500 drop-shadow-sm"
            aria-hidden="true"
          />
        )}
      </div>
      <Switch
        id="icon-label"
        checked={theme === "dark"}
        onCheckedChange={handleCheckedChange}
        aria-label="Toggle theme"
        className="data-[state=checked]:bg-neon-primary"
      />
    </div>
  );
};

export default ThemeSelector;
