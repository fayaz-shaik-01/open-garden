"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Home,
  PenLine,
  Lightbulb,
  FolderKanban,
  Bookmark,
  User,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "/": <Home size={16} />,
  "/writing": <PenLine size={16} />,
  "/notes": <Lightbulb size={16} />,
  "/projects": <FolderKanban size={16} />,
  "/bookmarks": <Bookmark size={16} />,
  "/about": <User size={16} />,
};

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[200px] xl:w-[240px] shrink-0 h-screen sticky top-0 border-r border-border">
      <div className="flex flex-col h-full px-3 py-4">
        {/* Identity */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 mb-1 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-semibold">
            {siteConfig.name.charAt(0)}
          </div>
          <span className="text-sm font-semibold truncate">
            {siteConfig.name}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 mt-4 space-y-0.5">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
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

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <a
                href={siteConfig.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
              <a
                href={siteConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={16} />
              </a>
              <a
                href={siteConfig.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
