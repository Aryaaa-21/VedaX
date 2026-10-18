import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";
import VedicPattern from "@/components/VedicPattern";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-background text-foreground flex flex-col font-sans relative">
      {/* Subtle Vedic dot/mandala background pattern */}
      <VedicPattern opacity={0.03} type="dots" />

      {/* Top Navbar: Visible only on mobile/tablet */}
      <div className="lg:hidden">
        <Navbar />
      </div>

      {/* Sidebar: Visible only on desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-grow min-w-0 flex flex-col pt-16 lg:pt-0 lg:pl-64 min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        <main className="flex-grow min-w-0 px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>

      {/* Bottom Navigation on mobile */}
      <BottomNavigation />
    </div>
  );
}
