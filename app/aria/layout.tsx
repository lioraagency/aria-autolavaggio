import BottomNav from "@/components/BottomNav";
import SwRegister from "./sw-register";

export default function AriaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-aria-bg flex flex-col">
      <SwRegister />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
