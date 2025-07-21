"use client";

import { Home, LogOut, Logs, Menu, Settings, User } from "lucide-react";
import { useState } from "react";
import GroupSelector from "@/components/GroupSelector";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { handleSignIn, handleSignOut } from "@/lib/auth-actions";

interface SideMenuProps {
  className?: string;
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
    };
  } | null;
}

export default function SideMenu({ className, session }: SideMenuProps) {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: "ホーム", href: "/" },
    { icon: Logs, label: "アクティビティ", href: "/activities" },
    { icon: User, label: "プロフィール", href: "/profile" },
    { icon: Settings, label: "設定", href: "/settings" },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label="メニューを開く"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>メニュー</SheetTitle>
        </SheetHeader>

        <GroupSelector className="w-full mt-2" />

        {/* ユーザー情報セクション */}
        {session?.user ? (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <form action={handleSignIn}>
              <Button type="submit" className="w-full">
                Googleでサインイン
              </Button>
            </form>
          </div>
        )}

        <nav className="mt-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {session?.user && (
          <div className="mt-auto px-4 pb-4">
            <form action={handleSignOut}>
              <Button
                type="submit"
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                サインアウト
              </Button>
            </form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
