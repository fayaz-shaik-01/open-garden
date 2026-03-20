import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const NOTES_DB = process.env.NOTION_NOTES_DB || "";
const PROJECTS_DB = process.env.NOTION_PROJECTS_DB || "";
const BOOKMARKS_DB = process.env.NOTION_BOOKMARKS_DB || "";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  github: string;
  stack: string[];
  featured: boolean;
  date: string;
  cover: string;
  status: string;
}

export interface BookmarkItem {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  date: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRichText(prop: any): string {
  if (!prop?.rich_text?.length) return "";
  return prop.rich_text.map((t: any) => t.plain_text).join("");
}

function getTitle(prop: any): string {
  if (!prop?.title?.length) return "";
  return prop.title.map((t: any) => t.plain_text).join("");
}

function getMultiSelect(prop: any): string[] {
  if (!prop?.multi_select) return [];
  return prop.multi_select.map((s: any) => s.name);
}

function getDate(prop: any): string {
  return prop?.date?.start || "";
}

function getUrl(prop: any): string {
  return prop?.url || "";
}

function getCheckbox(prop: any): boolean {
  return prop?.checkbox || false;
}

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(id);
}

function getSelect(prop: any): string {
  return prop?.select?.name || "";
}

function getFiles(prop: any): string {
  if (!prop?.files?.length) return "";
  const file = prop.files[0];
  if (file.type === "external") return file.external?.url || "";
  if (file.type === "file") return file.file?.url || "";
  return "";
}

// ─── Check if Notion is configured ──────────────────────────────────────────

export function isNotionConfigured(): boolean {
  return !!(process.env.NOTION_API_KEY && (NOTES_DB || PROJECTS_DB || BOOKMARKS_DB));
}

// ─── Fetch page body content (blocks) ───────────────────────────────────────

export interface RichTextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  code: boolean;
  underline: boolean;
  link: string | null;
}

export interface NotionBlock {
  id: string;
  type: string;
  text: string;
  richText: RichTextSegment[];
  children?: NotionBlock[];
  language?: string;
  icon?: string;
  checked?: boolean;
  caption?: string;
  url?: string;
}

function extractRichTextSegments(richText: any[]): RichTextSegment[] {
  if (!richText?.length) return [];
  return richText.map((t: any) => ({
    text: t.plain_text || "",
    bold: t.annotations?.bold || false,
    italic: t.annotations?.italic || false,
    strikethrough: t.annotations?.strikethrough || false,
    code: t.annotations?.code || false,
    underline: t.annotations?.underline || false,
    link: t.href || null,
  }));
}

function extractPlainText(richText: any[]): string {
  if (!richText?.length) return "";
  return richText.map((t: any) => t.plain_text).join("");
}

export async function getPageContent(pageId: string): Promise<NotionBlock[]> {
  if (!process.env.NOTION_API_KEY || !isValidUUID(pageId)) return [];

  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    return response.results.map((block: any) => {
      const type = block.type;
      const data = block[type] || {};

      const richTextSource = data.rich_text || data.text || [];
      const richText = extractRichTextSegments(richTextSource);
      const text = extractPlainText(richTextSource);

      return {
        id: block.id,
        type,
        text,
        richText,
        language: data.language || undefined,
        icon: data.icon?.emoji || data.icon?.external?.url || undefined,
        checked: data.checked ?? undefined,
        caption: data.caption ? extractPlainText(data.caption) : undefined,
        url: data.url || data.external?.url || data.file?.url || undefined,
      };
    });
  } catch (error) {
    console.error("Failed to fetch page content:", error);
    return [];
  }
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function getNotes(): Promise<Note[]> {
  if (!NOTES_DB || !process.env.NOTION_API_KEY || NOTES_DB === PROJECTS_DB) return getFallbackNotes();

  try {
    const response = await notion.databases.query({
      database_id: NOTES_DB,
      filter: {
        property: "Published",
        checkbox: { equals: true },
      },
      sorts: [{ property: "Date", direction: "descending" }],
    });

    return response.results.map((page: any) => ({
      id: page.id,
      title: getTitle(page.properties.Title),
      content: getRichText(page.properties.Content),
      tags: getMultiSelect(page.properties.Tags),
      date: getDate(page.properties.Date),
    }));
  } catch (error) {
    console.error("Failed to fetch notes from Notion:", error);
    return getFallbackNotes();
  }
}

export async function getNoteById(id: string): Promise<Note | null> {
  if (!process.env.NOTION_API_KEY || !isValidUUID(id)) {
    return getFallbackNotes().find((n) => n.id === id) || null;
  }

  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    return {
      id: page.id,
      title: getTitle(page.properties.Title),
      content: getRichText(page.properties.Content),
      tags: getMultiSelect(page.properties.Tags),
      date: getDate(page.properties.Date),
    };
  } catch (error) {
    console.error("Failed to fetch note:", error);
    return null;
  }
}

// ─── Projects ────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (!PROJECTS_DB || !process.env.NOTION_API_KEY) return getFallbackProjects();

  try {
    const response = await notion.databases.query({
      database_id: PROJECTS_DB,
      filter: {
        property: "Status",
        select: { equals: "Published" },
      },
      sorts: [{ property: "Published Date", direction: "descending" }],
    });

    return response.results.map((page: any) => ({
      id: page.id,
      name: getTitle(page.properties.Name),
      description: getRichText(page.properties.Excerpt),
      url: "",
      github: "",
      stack: getMultiSelect(page.properties.Tags),
      featured: false,
      date: getDate(page.properties["Published Date"]),
      cover: getFiles(page.properties.Cover),
      status: getSelect(page.properties.Status),
    }));
  } catch (error) {
    console.error("Failed to fetch projects from Notion:", error);
    return getFallbackProjects();
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!process.env.NOTION_API_KEY || !isValidUUID(id)) {
    return getFallbackProjects().find((p) => p.id === id) || null;
  }

  try {
    const page: any = await notion.pages.retrieve({ page_id: id });
    return {
      id: page.id,
      name: getTitle(page.properties.Name),
      description: getRichText(page.properties.Excerpt),
      url: "",
      github: "",
      stack: getMultiSelect(page.properties.Tags),
      featured: false,
      date: getDate(page.properties["Published Date"]),
      cover: getFiles(page.properties.Cover),
      status: getSelect(page.properties.Status),
    };
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export async function getBookmarks(): Promise<BookmarkItem[]> {
  if (!BOOKMARKS_DB || !process.env.NOTION_API_KEY || BOOKMARKS_DB === PROJECTS_DB) return getFallbackBookmarks();

  try {
    const response = await notion.databases.query({
      database_id: BOOKMARKS_DB,
      sorts: [{ property: "Date", direction: "descending" }],
    });

    return response.results.map((page: any) => ({
      id: page.id,
      title: getTitle(page.properties.Title),
      url: getUrl(page.properties.URL),
      description: getRichText(page.properties.Description),
      tags: getMultiSelect(page.properties.Tags),
      date: getDate(page.properties.Date),
    }));
  } catch (error) {
    console.error("Failed to fetch bookmarks from Notion:", error);
    return getFallbackBookmarks();
  }
}

// ─── Fallback Data ───────────────────────────────────────────────────────────

function getFallbackNotes(): Note[] {
  return [
    {
      id: "note-1",
      title: "TypeScript Mapped Types",
      content:
        "Mapped types in TypeScript let you create new types based on old ones by transforming properties. Use `keyof` with mapped types to iterate over property keys and apply transformations like making all properties optional or readonly.",
      tags: ["typescript", "programming"],
      date: "2024-12-15",
    },
    {
      id: "note-2",
      title: "React Server Components",
      content:
        "RSCs run exclusively on the server and never ship JavaScript to the client. They can directly access databases, file systems, and other server-side resources. Use 'use client' directive only for interactive components.",
      tags: ["react", "nextjs"],
      date: "2024-12-10",
    },
    {
      id: "note-3",
      title: "CSS Container Queries",
      content:
        "Container queries allow you to style elements based on the size of their containing element rather than the viewport. Use @container to define responsive styles that adapt to component context.",
      tags: ["css", "frontend"],
      date: "2024-12-05",
    },
    {
      id: "note-4",
      title: "Git Interactive Rebase",
      content:
        "Use `git rebase -i HEAD~n` to interactively rebase the last n commits. You can squash, reorder, edit, or drop commits. Great for cleaning up commit history before merging.",
      tags: ["git", "tooling"],
      date: "2024-11-28",
    },
    {
      id: "note-5",
      title: "Postgres JSONB Indexing",
      content:
        "GIN indexes on JSONB columns in PostgreSQL dramatically speed up containment queries (@>) and existence checks (?). Use `CREATE INDEX idx ON table USING GIN (column)` for best results.",
      tags: ["database", "postgres"],
      date: "2024-11-20",
    },
  ];
}

function getFallbackProjects(): Project[] {
  return [
    {
      id: "project-1",
      name: "DevFlow",
      description:
        "A developer productivity dashboard that integrates with GitHub, Jira, and Slack to provide a unified view of your development workflow. Built with real-time updates and customizable widgets.",
      url: "https://devflow.example.com",
      github: "https://github.com/shahbazfayaz/devflow",
      stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL", "WebSocket"],
      featured: true,
      date: "2024-11-01",
      cover: "",
      status: "Published",
    },
    {
      id: "project-2",
      name: "MarkdownMail",
      description:
        "Write emails in Markdown and send them beautifully formatted. Supports templates, scheduled sending, and a clean distraction-free writing experience.",
      url: "https://markdownmail.example.com",
      github: "https://github.com/shahbazfayaz/markdownmail",
      stack: ["React", "Node.js", "SendGrid", "MDX"],
      featured: true,
      date: "2024-09-15",
      cover: "",
      status: "Published",
    },
    {
      id: "project-3",
      name: "APIBench",
      description:
        "A lightweight API benchmarking tool that helps you measure response times, throughput, and reliability of your REST and GraphQL endpoints with beautiful reports.",
      url: "",
      github: "https://github.com/shahbazfayaz/apibench",
      stack: ["Go", "React", "D3.js", "SQLite"],
      featured: false,
      date: "2024-07-20",
      cover: "",
      status: "Published",
    },
    {
      id: "project-4",
      name: "Dotfiles Manager",
      description:
        "A CLI tool for managing and syncing dotfiles across machines. Supports encrypted secrets, machine-specific configs, and automatic backup to git.",
      url: "",
      github: "https://github.com/shahbazfayaz/dotfiles-manager",
      stack: ["Rust", "TOML", "Shell"],
      featured: false,
      date: "2024-05-10",
      cover: "",
      status: "Published",
    },
  ];
}

function getFallbackBookmarks(): BookmarkItem[] {
  return [
    {
      id: "bookmark-1",
      title: "The Art of Debugging",
      url: "https://example.com/art-of-debugging",
      description: "A comprehensive guide to systematic debugging techniques for modern software systems.",
      tags: ["engineering", "debugging"],
      date: "2024-12-12",
    },
    {
      id: "bookmark-2",
      title: "Designing Data-Intensive Applications",
      url: "https://dataintensive.net",
      description: "Martin Kleppmann's essential book on the principles behind reliable, scalable systems.",
      tags: ["architecture", "books"],
      date: "2024-11-30",
    },
    {
      id: "bookmark-3",
      title: "Modern CSS Reset",
      url: "https://example.com/modern-css-reset",
      description: "A sensible modern CSS reset with explanations for each rule.",
      tags: ["css", "frontend"],
      date: "2024-11-15",
    },
    {
      id: "bookmark-4",
      title: "Postgres Performance Tips",
      url: "https://example.com/postgres-performance",
      description: "Practical tips for optimizing PostgreSQL queries and configuration.",
      tags: ["database", "performance"],
      date: "2024-10-28",
    },
  ];
}
