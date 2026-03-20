import { notFound } from "next/navigation";
import { getProjectById, getPageContent } from "@/lib/notion";
import type { NotionBlock, RichTextSegment } from "@/lib/notion";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import React from "react";

interface PageProps {
  params: { id: string };
}

export const revalidate = 3600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProjectById(params.id);
  if (!project) return {};

  return {
    title: project.name,
    description: project.description.slice(0, 160),
  };
}

function renderRichText(segments: RichTextSegment[]): React.ReactNode {
  if (!segments.length) return null;

  return segments.map((seg, i) => {
    let node: React.ReactNode = seg.text;

    if (seg.code) {
      node = (
        <code key={i} className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground">
          {node}
        </code>
      );
    }
    if (seg.bold) {
      node = <strong key={`b-${i}`}>{node}</strong>;
    }
    if (seg.italic) {
      node = <em key={`i-${i}`}>{node}</em>;
    }
    if (seg.strikethrough) {
      node = <s key={`s-${i}`}>{node}</s>;
    }
    if (seg.underline) {
      node = <u key={`u-${i}`}>{node}</u>;
    }
    if (seg.link) {
      node = (
        <a
          key={`a-${i}`}
          href={seg.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 hover:text-accent/80"
        >
          {node}
        </a>
      );
    }

    return <React.Fragment key={i}>{node}</React.Fragment>;
  });
}

function renderBlock(block: NotionBlock) {
  const content = block.richText.length > 0 ? renderRichText(block.richText) : block.text;

  switch (block.type) {
    case "paragraph":
      if (!block.text && block.richText.length === 0) return <div key={block.id} className="h-4" />;
      return <p key={block.id}>{content}</p>;

    case "heading_1":
      return <h1 key={block.id}>{content}</h1>;
    case "heading_2":
      return <h2 key={block.id}>{content}</h2>;
    case "heading_3":
      return <h3 key={block.id}>{content}</h3>;

    case "bulleted_list_item":
      return <li key={block.id}>{content}</li>;
    case "numbered_list_item":
      return <li key={block.id}>{content}</li>;

    case "to_do":
      return (
        <li key={block.id} className="flex items-start gap-2 list-none -ml-6">
          <input
            type="checkbox"
            checked={block.checked || false}
            readOnly
            className="mt-1.5 h-4 w-4 rounded border-border accent-accent"
          />
          <span className={block.checked ? "line-through text-muted-foreground" : ""}>
            {content}
          </span>
        </li>
      );

    case "code":
      return (
        <div key={block.id} className="relative group my-4">
          {block.language && (
            <div className="absolute top-0 right-0 px-3 py-1 text-[11px] font-mono text-muted-foreground bg-muted/50 rounded-bl rounded-tr-lg">
              {block.language}
            </div>
          )}
          <pre className="!bg-[#1e1e2e] dark:!bg-[#1a1a2e] !rounded-lg !p-4 !pt-8 overflow-x-auto">
            <code className="!text-sm !font-mono !leading-relaxed whitespace-pre-wrap break-words">
              {block.text}
            </code>
          </pre>
          {block.caption && (
            <p className="text-xs text-muted-foreground mt-1 text-center">{block.caption}</p>
          )}
        </div>
      );

    case "quote":
      return (
        <blockquote key={block.id} className="!border-l-accent !border-l-2 !pl-4 !italic !text-muted-foreground">
          {content}
        </blockquote>
      );

    case "callout":
      return (
        <div
          key={block.id}
          className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border border-border/50 my-4"
        >
          {block.icon && <span className="text-lg flex-shrink-0 mt-0.5">{block.icon}</span>}
          <div className="text-sm leading-relaxed">{content}</div>
        </div>
      );

    case "divider":
      return <hr key={block.id} className="!my-6 !border-border" />;

    case "image":
      return (
        <figure key={block.id} className="my-6">
          {block.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={block.url}
              alt={block.caption || ""}
              className="rounded-lg w-full"
            />
          )}
          {block.caption && (
            <figcaption className="text-xs text-muted-foreground mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "bookmark":
    case "embed":
    case "link_preview":
      return (
        <div key={block.id} className="my-4 p-3 rounded-lg border border-border bg-muted/30">
          <a
            href={block.url || block.text}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline break-all"
          >
            {block.caption || block.url || block.text}
          </a>
        </div>
      );

    case "equation":
      return (
        <div key={block.id} className="my-4 p-4 text-center font-mono text-sm bg-muted/30 rounded-lg overflow-x-auto">
          {block.text}
        </div>
      );

    case "toggle":
      return (
        <details key={block.id} className="my-2 cursor-pointer">
          <summary className="font-medium">{content}</summary>
        </details>
      );

    case "table_row":
      return null;

    default:
      if (!block.text && block.richText.length === 0) return null;
      return <p key={block.id}>{content}</p>;
  }
}

function renderBlocks(blocks: NotionBlock[]) {
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ol" | "ul" | null = null;
  let todoItems: React.ReactNode[] = [];

  function flushList() {
    if (listItems.length > 0 && listType) {
      const ListTag = listType;
      elements.push(<ListTag key={`list-${elements.length}`}>{listItems}</ListTag>);
      listItems = [];
      listType = null;
    }
  }

  function flushTodos() {
    if (todoItems.length > 0) {
      elements.push(
        <ul key={`todo-${elements.length}`} className="space-y-1 my-3 list-none pl-0">
          {todoItems}
        </ul>
      );
      todoItems = [];
    }
  }

  for (const block of blocks) {
    if (block.type === "numbered_list_item") {
      flushTodos();
      if (listType !== "ol") { flushList(); listType = "ol"; }
      listItems.push(renderBlock(block));
    } else if (block.type === "bulleted_list_item") {
      flushTodos();
      if (listType !== "ul") { flushList(); listType = "ul"; }
      listItems.push(renderBlock(block));
    } else if (block.type === "to_do") {
      flushList();
      todoItems.push(renderBlock(block));
    } else {
      flushList();
      flushTodos();
      elements.push(renderBlock(block));
    }
  }
  flushList();
  flushTodos();

  return elements;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const [project, blocks] = await Promise.all([
    getProjectById(params.id),
    getPageContent(params.id),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to Projects
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-2xl font-bold tracking-tight">
            {project.name}
          </h1>
          {project.featured && (
            <span className="text-xs px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
              Featured
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github size={14} />
              Source
            </a>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={14} />
              Live
            </a>
          )}
        </div>
      </header>

      <article className="prose prose-neutral dark:prose-invert max-w-none prose-pre:bg-transparent prose-pre:p-0">
        {project.description && (
          <p className="leading-7 text-muted-foreground">{project.description}</p>
        )}
        {blocks.length > 0 && renderBlocks(blocks)}
      </article>

      {project.stack.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Tech Stack
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/50"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
