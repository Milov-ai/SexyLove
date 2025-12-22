import React from "react";
import Header from "./Header";
import { useAchievementDetector } from "../hooks/useAchievementDetector";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  useAchievementDetector();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-secondary/10 text-foreground relative overflow-hidden">
      {/* Decorative background elements - Visual Morbo */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10">
        <Header />
        <main className="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
