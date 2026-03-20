import Link from "next/link";
import { getNotes } from "@/lib/notion";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "Short-form notes and things I've learned.",
};

export const revalidate = 3600;

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Notes</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Short-form notes, TIL moments, and things worth remembering.
      </p>

      <div className="divide-y divide-border">
        {notes.map((note) => (
          <Link
            key={note.id}
            href={`/notes/${note.id}`}
            className="block py-5 group"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium group-hover:text-accent transition-colors">
                {note.title}
              </h2>
              {note.date && (
                <time className="text-xs text-muted-foreground shrink-0">
                  {new Date(note.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
              {note.content}
            </p>
            {note.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {notes.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No notes yet.
        </p>
      )}
    </div>
  );
}
