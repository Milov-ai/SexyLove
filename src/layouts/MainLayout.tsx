import React from "react";
import Header from "./Header";
import { useAchievementDetector } from "../hooks/useAchievementDetector";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  useAchievementDetector();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-pink-500/5 dark:from-background dark:via-background dark:to-purple-900/20 text-foreground relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-pink-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none z-0" />

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
