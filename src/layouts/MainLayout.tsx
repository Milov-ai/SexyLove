import React from "react";
import Header from "./Header";
import { useAchievementDetector } from "../hooks/useAchievementDetector";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  useAchievementDetector();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-secondary/10 text-foreground relative overflow-hidden transition-colors duration-700">
      {/* Decorative background elements - Visual Morbo */}
      {/* Primary Blob */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none z-0 animate-blob mix-blend-screen" />

      {/* Secondary Blob */}
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/20 blur-[120px] pointer-events-none z-0 animate-blob animation-delay-4000 mix-blend-screen" />

      <div className="relative z-10">
        <Header />
        <main className="pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
