"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Truck, PackageSearch, Factory, Lightbulb, Sparkles, Database } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/supplier", label: "Supplier Analytics", icon: Factory },
  { href: "/logistics", label: "Logistics", icon: Truck },
  { href: "/inventory", label: "Inventory", icon: PackageSearch },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/explore", label: "Explore Data", icon: Database },
  { href: "/assistant", label: "AI Assistant", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex flex-col p-4 space-y-8">
      <div className="flex items-center space-x-3 px-2 mt-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <span className="font-bold text-white tracking-tighter">A</span>
        </div>
        <span className="font-semibold text-lg tracking-tight">Supply Chain Data</span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-neutral-800/80 text-white shadow-sm ring-1 ring-neutral-700/50"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800/50"
              )}
            >
              <link.icon className={cn("w-4 h-4", active ? "text-indigo-400" : "text-neutral-500")} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="pt-4 border-t border-neutral-800/50">
        <div className="px-3 py-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs font-medium text-indigo-300">Connected</p>
          <p className="text-xs text-neutral-400 mt-1">Live Backend Sync</p>
        </div>
      </div>
    </div>
  );
}
