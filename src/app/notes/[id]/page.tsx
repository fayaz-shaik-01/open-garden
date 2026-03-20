import { notFound } from "next/navigation";
import { getNoteById, getNotes } from "@/lib/notion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const note = await getNoteById(params.id);
  if (!note) return {};

  return {
    title: note.title,
    description: note.content.slice(0, 160),
  };
}

export default async function NoteDetailPage({ params }: PageProps) {
  const note = await getNoteById(params.id);

  if (!note) {
    notFound();
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to Notes
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          {note.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {note.date && (
            <time>
              {new Date(note.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {note.tags.length > 0 && (
            <>
              <span className="text-border">·</span>
              <div className="flex items-center gap-1.5">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-1.5 py-0.5 rounded bg-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="leading-7">{note.content}</p>
      </article>
    </div>
  );
}
