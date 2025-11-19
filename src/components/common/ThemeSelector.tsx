import { useTheme } from "@/context/theme.context";
import { MoonIcon, SunIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  const handleCheckedChange = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="inline-flex items-center gap-2">
      <Switch
        id="icon-label"
        checked={theme === "dark"}
        onCheckedChange={handleCheckedChange}
        aria-label="Toggle theme"
      />
      <Label htmlFor="icon-label">
        <span className="sr-only">Toggle theme</span>
        {theme === "dark" ? (
          <MoonIcon className="size-4" aria-hidden="true" />
        ) : (
          <SunIcon className="size-4" aria-hidden="true" />
        )}
      </Label>
    </div>
  );
};

export default ThemeSelector;
