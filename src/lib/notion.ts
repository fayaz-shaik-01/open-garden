import { Client } from "@notionhq/client";
import { getAllDatabases, getDatabaseItems } from "./notion-discovery";

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
  return !!process.env.NOTION_API_KEY;
}

// ─── Auto-discovery functions ────────────────────────────────────────────────

export async function getNotesFromDiscovery(): Promise<Note[]> {
  try {
    const databases = await getAllDatabases();
    const notesDatabase = databases.find(db => 
      db.type === "notes" || 
      db.title.toLowerCase().includes("note")
    );
    
    if (!notesDatabase) return getFallbackNotes();
    
    const items = await getDatabaseItems(notesDatabase.id);
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      content: extractContent(item.properties),
      tags: extractTags(item.properties),
      date: extractDate(item.properties) || item.created_time,
    }));
  } catch (error) {
    console.error("Failed to fetch notes from discovery:", error);
    return getFallbackNotes();
  }
}

export async function getProjectsFromDiscovery(): Promise<Project[]> {
  try {
    const databases = await getAllDatabases();
    const projectsDatabase = databases.find(db => 
      db.type === "projects" || 
      db.title.toLowerCase().includes("project")
    );
    
    if (!projectsDatabase) return getFallbackProjects();
    
    const items = await getDatabaseItems(projectsDatabase.id);
    
    return items.map(item => ({
      id: item.id,
      name: item.title,
      description: extractContent(item.properties) || "",
      url: extractUrl(item.properties) || "",
      github: "",
      stack: extractTags(item.properties),
      featured: false,
      date: extractDate(item.properties) || item.created_time,
      cover: "",
      status: "Published",
    }));
  } catch (error) {
    console.error("Failed to fetch projects from discovery:", error);
    return getFallbackProjects();
  }
}

export async function getBookmarksFromDiscovery(): Promise<BookmarkItem[]> {
  try {
    const databases = await getAllDatabases();
    const bookmarksDatabase = databases.find(db => 
      db.type === "bookmarks" || 
      db.title.toLowerCase().includes("bookmark")
    );
    
    if (!bookmarksDatabase) return getFallbackBookmarks();
    
    const items = await getDatabaseItems(bookmarksDatabase.id);
    
    return items.map(item => ({
      id: item.id,
      title: item.title,
      url: extractUrl(item.properties) || "",
      description: extractContent(item.properties) || "",
      tags: extractTags(item.properties),
      date: extractDate(item.properties) || item.created_time,
    }));
  } catch (error) {
    console.error("Failed to fetch bookmarks from discovery:", error);
    return getFallbackBookmarks();
  }
}

// ─── Helper extraction functions ─────────────────────────────────────────────

function extractContent(properties: Record<string, any>): string {
  for (const [key, value] of Object.entries(properties)) {
    if ((value as any).rich_text?.length) {
      return (value as any).rich_text.map((t: any) => t.plain_text).join("");
    }
    if ((value as any).title?.length) {
      return (value as any).title.map((t: any) => t.plain_text).join("");
    }
  }
  return "";
}

function extractTags(properties: Record<string, any>): string[] {
  for (const [key, value] of Object.entries(properties)) {
    if ((value as any).multi_select?.length) {
      return (value as any).multi_select.map((s: any) => s.name);
    }
    if ((value as any).select?.name) {
      return [(value as any).select.name];
    }
  }
  return [];
}

function extractDate(properties: Record<string, any>): string {
  for (const [key, value] of Object.entries(properties)) {
    if ((value as any).date?.start) {
      return (value as any).date.start;
    }
  }
  return "";
}

function extractUrl(properties: Record<string, any>): string {
  for (const [key, value] of Object.entries(properties)) {
    if ((value as any).url) {
      return (value as any).url;
    }
  }
  return "";
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
  // Try discovery first, fallback to legacy method
  if (process.env.NOTION_API_KEY) {
    try {
      const discoveredNotes = await getNotesFromDiscovery();
      if (discoveredNotes.length > 0) {
        return discoveredNotes;
      }
    } catch (error) {
      console.warn("Discovery failed, trying legacy method:", error);
    }
  }
  
  // Legacy method
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
  // Try discovery first, fallback to legacy method
  if (process.env.NOTION_API_KEY) {
    try {
      const discoveredProjects = await getProjectsFromDiscovery();
      if (discoveredProjects.length > 0) {
        return discoveredProjects;
      }
    } catch (error) {
      console.warn("Discovery failed, trying legacy method:", error);
    }
  }
  
  // Legacy method
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
  // Try discovery first, fallback to legacy method
  if (process.env.NOTION_API_KEY) {
    try {
      const discoveredBookmarks = await getBookmarksFromDiscovery();
      if (discoveredBookmarks.length > 0) {
        return discoveredBookmarks;
      }
    } catch (error) {
      console.warn("Discovery failed, trying legacy method:", error);
    }
  }
  
  // Legacy method
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
  return [];
}

function getFallbackProjects(): ProjectItem[] {
  return [];
}

function getFallbackBookmarks(): BookmarkItem[] {
  return [];
}
