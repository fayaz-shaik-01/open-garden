"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, X, Home, PenLine, Lightbulb, FolderKanban, Bookmark, User } from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "/": <Home size={16} />,
  "/writing": <PenLine size={16} />,
  "/notes": <Lightbulb size={16} />,
  "/projects": <FolderKanban size={16} />,
  "/bookmarks": <Bookmark size={16} />,
  "/about": <User size={16} />,
};

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="lg:hidden">
      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 border-b border-border bg-background/80 backdrop-blur-md">
        <Link href="/" className="text-sm font-semibold">
          {siteConfig.name}
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out nav */}
      <div
        className={`fixed top-14 right-0 bottom-0 z-50 w-64 bg-background border-l border-border transform transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="flex flex-col p-3 space-y-0.5">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span className="opacity-70">{iconMap[item.href]}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
