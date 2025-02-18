"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Target, LogOut, Wallet } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home
    },
    {
      title: "Habits",
      href: "/habits",
      icon: Target
    },
    {
      title: "Deposits",
      href: "/deposits",
      icon: Wallet
    }
  ];

  const handleSignOut = () => {
    router.push('/');  // Redirect immediately
    supabase.auth.signOut();  // Sign out in the background
  };

  return (
    <div className="pb-12 min-h-screen border-r">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
              <circle cx="12" cy="12" r="11" />
            </svg>
            HabitPledge
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="px-4 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}