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
      className="gap-4"
      ref={container}
    >
      <TabsList className="h-auto gap-2 rounded-xl p-1">
        {tabs.map(({ icon: Icon, name, value }) => {
          const isActive = activeTab === value;

          return (
            <div
              key={value}
              data-value={value}
              className={cn(
                "flex h-8 items-center justify-center overflow-hidden rounded-md",
                isActive ? "flex-1" : "flex-none",
              )}
              onClick={() => handleTabChange(value)}
            >
              <TabsTrigger value={value} asChild>
                <div className="flex h-8 w-full items-center justify-center">
                  <Icon className="aspect-square size-4 flex-shrink-0" />
                  {isActive && (
                    <span className="font-medium max-sm:hidden ml-2">
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
