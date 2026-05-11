"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/aria/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full h-12 rounded-xl border border-red-500/30 text-red-400 font-condensed font-black uppercase tracking-wider text-sm active:opacity-70 transition-opacity"
    >
      Déconnexion
    </button>
  );
}
