import { useState } from "react";
import { useVaultStore } from "../../store/vault.store";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Settings,
  AreaChart,
  Sparkles,
  Plus,
  ArrowLeft,
  ToyBrick,
  Building,
  Tag,
  Pencil,
  Bell,
} from "lucide-react";
import { notificationService } from "../../services/NotificationService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Fantasy } from "../../schemas/vault";

// Main OptionsMenu component
interface OptionsMenuProps {
  isDataAnalysisActive: boolean;
  onDataAnalysisToggle: (active: boolean) => void;
  onManageCategory: (category: "toys" | "settingPlaces" | "categories") => void;
  onAddFantasyClick: () => void;
  onEditFantasyClick: (fantasy: Fantasy) => void;
}

const OptionsMenu = ({
  isDataAnalysisActive,
  onDataAnalysisToggle,
  onManageCategory,
  onAddFantasyClick,
  onEditFantasyClick,
}: OptionsMenuProps) => {
  const { decryptedVault } = useVaultStore();
  const [view, setView] = useState("main"); // 'main' | 'settings' | 'fantasies'

  const MainView = () => (
    <div className="grid gap-2">
      <Button
        variant="ghost"
        onClick={() => setView("settings")}
        className="justify-start"
      >
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
      <Button
        variant="ghost"
        onClick={() => setView("fantasies")}
        className="justify-start"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Fantasies
      </Button>
      <Button
        variant="ghost"
        onClick={() => notificationService.scheduleTestNotification()}
        className="justify-start text-pink-500 hover:text-pink-600 hover:bg-pink-50"
      >
        <Bell className="mr-2 h-4 w-4" />
        Test Notification
      </Button>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="flex items-center space-x-2">
          <AreaChart className="h-4 w-4" />
          <Label htmlFor="data-analysis-switch">Data Analysis</Label>
        </div>
        <Switch
          id="data-analysis-switch"
          checked={isDataAnalysisActive}
          onCheckedChange={onDataAnalysisToggle}
        />
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-2">
      <div className="flex items-center relative mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-2"
          onClick={() => setView("main")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-medium leading-none text-center flex-grow">
          Manage Categories
        </h4>
      </div>
      <Button
        variant="ghost"
        onClick={() => onManageCategory("toys")}
        className="w-full justify-start"
      >
        <ToyBrick className="mr-2 h-4 w-4" />
        Manage Toys
      </Button>
      <Button
        variant="ghost"
        onClick={() => onManageCategory("settingPlaces")}
        className="w-full justify-start"
      >
        <Building className="mr-2 h-4 w-4" />
        Manage Places
      </Button>
      <Button
        variant="ghost"
        onClick={() => onManageCategory("categories")}
        className="w-full justify-start"
      >
        <Tag className="mr-2 h-4 w-4" />
        Manage Categories
      </Button>
    </div>
  );

  const FantasiesView = () => (
    <div className="space-y-2">
      <div className="flex items-center relative mb-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-2"
          onClick={() => setView("main")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-medium leading-none text-center flex-grow">
          Fantasies
        </h4>
      </div>
      <Button onClick={onAddFantasyClick} className="w-full justify-center">
        <Plus className="mr-2 h-4 w-4" />
        Add Fantasy
      </Button>
      <ScrollArea className="h-48">
        <div className="space-y-1 pr-2">
          {decryptedVault?.fantasies?.map((fantasy) => (
            <Button
              key={fantasy.id}
              variant="ghost"
              onClick={() => onEditFantasyClick(fantasy)}
              className="w-full justify-between"
            >
              <span className="truncate">{fantasy.title}</span>
              <Pencil className="h-3 w-3" />
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <Popover onOpenChange={() => setView("main")}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full mt-2">
          <Plus className="mr-2 h-4 w-4" /> Opciones
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {view === "main" && <MainView />}
        {view === "settings" && <SettingsView />}
        {view === "fantasies" && <FantasiesView />}
      </PopoverContent>
    </Popover>
  );
};

export default OptionsMenu;
