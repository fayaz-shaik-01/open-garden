"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Lightbulb, X, Database, Bookmark, Rocket, Book, FileCheck, Link } from "lucide-react";
import { getAllDatabases, getDatabaseItems } from "@/lib/notion-discovery";
import { getDatabaseConfig, getDatabaseTypePath } from "@/types/database";

interface SearchItem {
  id: string;
  title: string;
  type: "post" | "note" | "database";
  href: string;
  summary?: string;
  databaseType?: string;
  databaseTitle?: string;
}

interface SearchDialogProps {
  items: SearchItem[];
}

export function SearchDialog({ items }: SearchDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [databaseItems, setDatabaseItems] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && !loading && databaseItems.length === 0) {
      loadDatabaseItems();
    }
  }, [open]);

  const loadDatabaseItems = async () => {
    setLoading(true);
    try {
      const databases = await getAllDatabases();
      const allItems: SearchItem[] = [];

      for (const database of databases) {
        const items = await getDatabaseItems(database.id, 10); // Limit to 10 items per database for performance
        const config = getDatabaseConfig(database.type);
        
        const searchItems = items.map(item => ({
          id: item.id,
          title: item.title,
          type: "database" as const,
          href: `/db/${database.id}/${item.id}`,
          summary: extractSummary(item.properties),
          databaseType: database.type,
          databaseTitle: database.title,
        }));
        
        allItems.push(...searchItems);
      }
      
      setDatabaseItems(allItems);
    } catch (error) {
      console.error("Failed to load database items for search:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractSummary = (properties: Record<string, any>): string => {
    for (const [key, value] of Object.entries(properties)) {
      if ((value as any).rich_text?.length) {
        const text = (value as any).rich_text.map((t: any) => t.plain_text).join("");
        if (text.length > 0) return text.slice(0, 100) + (text.length > 100 ? "..." : "");
      }
      if ((value as any).title?.length) {
        const text = (value as any).title.map((t: any) => t.plain_text).join("");
        if (text.length > 0) return text.slice(0, 100) + (text.length > 100 ? "..." : "");
      }
    }
    return "";
  };

  const getItemIcon = (type: string, databaseType?: string) => {
    if (type === "post") return <FileText size={14} className="text-muted-foreground shrink-0" />;
    if (type === "note") return <Lightbulb size={14} className="text-muted-foreground shrink-0" />;
    if (type === "database") {
      const iconMap = {
        notes: <Lightbulb size={14} className="text-muted-foreground shrink-0" />,
        projects: <Rocket size={14} className="text-muted-foreground shrink-0" />,
        bookmarks: <Bookmark size={14} className="text-muted-foreground shrink-0" />,
        subjects: <Book size={14} className="text-muted-foreground shrink-0" />,
        papers: <FileText size={14} className="text-muted-foreground shrink-0" />,
        solutions: <FileCheck size={14} className="text-muted-foreground shrink-0" />,
        resources: <Link size={14} className="text-muted-foreground shrink-0" />,
      };
      return iconMap[databaseType as keyof typeof iconMap] || <Database size={14} className="text-muted-foreground shrink-0" />;
    }
    return <Database size={14} className="text-muted-foreground shrink-0" />;
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [...items, ...databaseItems].slice(0, 10);
    const q = query.toLowerCase();
    const allItems = [...items, ...databaseItems];
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary?.toLowerCase().includes(q) ||
        item.databaseTitle?.toLowerCase().includes(q)
    );
  }, [items, databaseItems, query]);

  const handleSelect = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="relative max-w-lg mx-auto mt-[15vh]">
        <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search size={16} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search writing and notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[300px] overflow-y-auto p-2">
            {filtered.length === 0 && !loading && (
              <div className="text-sm text-muted-foreground text-center py-6">
                No results found.
              </div>
            )}
            
            {loading && (
              <div className="text-sm text-muted-foreground text-center py-6">
                Loading databases...
              </div>
            )}
            
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSelect(item.href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-muted transition-colors"
              >
                {getItemIcon(item.type, item.databaseType)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.title}</p>
                  {item.summary && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {item.summary}
                    </p>
                  )}
                  {item.databaseTitle && (
                    <p className="text-xs text-accent truncate mt-0.5">
                      {item.databaseTitle}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase shrink-0">
                  {item.type === "database" ? item.databaseType : item.type}
                </span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
