import { getBookmarks } from "@/lib/notion";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bookmarks",
  description: "A curated collection of links and resources.",
};

export const revalidate = 3600;

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks();

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Bookmarks</h1>
      <p className="text-muted-foreground text-sm mb-8">
        A curated collection of articles, tools, and resources I find valuable.
      </p>

      <div className="divide-y divide-border">
        {bookmarks.map((bookmark) => (
          <a
            key={bookmark.id}
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium group-hover:text-accent transition-colors flex items-center gap-1.5">
                  {bookmark.title}
                  <ExternalLink
                    size={12}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </h2>
                {bookmark.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                {bookmark.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {bookmark.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {bookmark.date && (
                <time className="text-xs text-muted-foreground shrink-0">
                  {new Date(bookmark.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
            </div>
          </a>
        ))}
      </div>

      {bookmarks.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No bookmarks yet.
        </p>
      )}
    </div>
  );
}
