import { useState, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface Tab {
  name: string;
  value: string;
  icon: LucideIcon;
}

interface ExpandableTabsProps {
  tabs: Tab[];
  defaultValue: string;
  onTabChange: (value: string) => void;
}

const ExpandableTabs = ({
  tabs,
  defaultValue,
  onTabChange,
}: ExpandableTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  const container = useRef(null);

  useGSAP(
    () => {
      // Animate the active tab width
      gsap.to(`[data-value="${activeTab}"]`, {
        width: 120,
        duration: 0.3,
        ease: "power2.inOut",
      });
      // Animate the inactive tabs width
      tabs.forEach((tab) => {
        if (tab.value !== activeTab) {
          gsap.to(`[data-value="${tab.value}"]`, {
            width: 32,
            duration: 0.3,
            ease: "power2.inOut",
          });
        }
      });
    },
    { scope: container, dependencies: [activeTab] },
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onTabChange(value);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 overflow-visible"
      ref={container}
    >
      <TabsList className="h-14 gap-2 rounded-full p-2 glass-dirty border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5 dark:bg-black/20">
        {tabs.map(({ icon: Icon, name, value }) => {
          const isActive = activeTab === value;

          return (
            <div
              key={value}
              data-value={value}
              className={cn(
                "flex h-10 items-center justify-center overflow-hidden rounded-full transition-all duration-300",
                isActive ? "bg-white/10 dark:bg-white/5" : "hover:bg-white/5",
              )}
              onClick={() => handleTabChange(value)}
            >
              <TabsTrigger value={value} asChild>
                <div className="flex h-10 w-full items-center justify-center px-4">
                  <Icon
                    className={cn(
                      "aspect-square size-4 flex-shrink-0 transition-colors duration-300",
                      isActive ? "text-neon-primary" : "text-muted-foreground",
                    )}
                  />
                  {isActive && (
                    <span className="font-bold text-xs tracking-widest uppercase ml-2 text-foreground dark:text-white">
                      {name}
                    </span>
                  )}
                </div>
              </TabsTrigger>
            </div>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default ExpandableTabs;
