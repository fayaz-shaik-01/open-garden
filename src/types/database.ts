export interface DatabaseInfo {
  id: string;
  title: string;
  description?: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
  url: string;
  type: DatabaseType;
  workspace: WorkspaceType;
}

export type DatabaseType = 
  | "notes" 
  | "projects" 
  | "bookmarks" 
  | "subjects"
  | "papers" 
  | "solutions"
  | "resources"
  | "unknown";

export type WorkspaceType = string;

export interface DatabaseItem {
  id: string;
  title: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
  url: string;
  databaseType: DatabaseType;
  databaseId: string;
  workspace: string;
  resolvedRelations?: ResolvedRelation[];
  content?: any[]; // Notion page content blocks
}

export interface ResolvedRelation {
  propertyName: string;
  items: { id: string; title: string; databaseId?: string }[];
}

export interface DatabaseConfig {
  type: DatabaseType;
  titleProperty: string;
  contentProperty?: string;
  dateProperty?: string;
  tagsProperty?: string;
  urlProperty?: string;
  descriptionProperty?: string;
  icon: string;
  color: string;
}

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  notes: {
    type: "notes",
    titleProperty: "Title",
    contentProperty: "Content",
    dateProperty: "Date",
    tagsProperty: "Tags",
    icon: "📝",
    color: "blue",
  },
  projects: {
    type: "projects",
    titleProperty: "Name",
    contentProperty: "Description",
    dateProperty: "Published Date",
    tagsProperty: "Tags",
    urlProperty: "URL",
    icon: "🚀",
    color: "purple",
  },
  bookmarks: {
    type: "bookmarks",
    titleProperty: "Title",
    contentProperty: "Description",
    dateProperty: "Date",
    tagsProperty: "Tags",
    urlProperty: "URL",
    icon: "🔖",
    color: "green",
  },
  subjects: {
    type: "subjects",
    titleProperty: "Title",
    contentProperty: "Description",
    tagsProperty: "Tags",
    icon: "📚",
    color: "orange",
  },
  papers: {
    type: "papers",
    titleProperty: "Title",
    contentProperty: "Description",
    dateProperty: "Date",
    tagsProperty: "Tags",
    icon: "📄",
    color: "red",
  },
  solutions: {
    type: "solutions",
    titleProperty: "Title",
    contentProperty: "Content",
    tagsProperty: "Tags",
    icon: "✅",
    color: "teal",
  },
  resources: {
    type: "resources",
    titleProperty: "Title",
    contentProperty: "Description",
    urlProperty: "URL",
    tagsProperty: "Tags",
    icon: "🔗",
    color: "yellow",
  },
  unknown: {
    type: "unknown",
    titleProperty: "Title",
    contentProperty: "Content",
    tagsProperty: "Tags",
    icon: "📋",
    color: "gray",
  },
};

export function getDatabaseConfig(type: DatabaseType): DatabaseConfig {
  return DATABASE_CONFIGS[type] || DATABASE_CONFIGS.unknown;
}

export function getDatabaseTypeLabel(type: DatabaseType): string {
  const labels: Record<DatabaseType, string> = {
    notes: "Notes",
    projects: "Projects",
    bookmarks: "Bookmarks",
    subjects: "Subjects",
    papers: "Papers",
    solutions: "Solutions",
    resources: "Resources",
    unknown: "Unknown",
  };
  return labels[type] || "Unknown";
}

export function getDatabaseTypePath(type: DatabaseType): string {
  const paths: Record<DatabaseType, string> = {
    notes: "notes",
    projects: "projects",
    bookmarks: "bookmarks",
    subjects: "subjects",
    papers: "papers",
    solutions: "solutions",
    resources: "resources",
    unknown: "database",
  };
  return paths[type] || "database";
}

export function getWorkspacePath(workspace: WorkspaceType): string {
  return workspace.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

export function getWorkspaceLabel(workspace: WorkspaceType): string {
  // Convert workspace-name to Workspace Name
  return workspace
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getWorkspaceIcon(workspace: WorkspaceType): string {
  // Dynamic icon assignment based on workspace name
  const icons: Record<string, string> = {
    "gate-ec": "🎓",
    "ml": "🤖", 
    "personal": "👤",
    "research": "🔬",
    "projects": "🚀",
    "work": "💼",
    "learning": "📚",
    "finance": "💰",
    "health": "🏥",
  };
  
  // Return predefined icon or default
  return icons[workspace.toLowerCase()] || "📋";
}

export function getAvailableWorkspaces(): string[] {
  // Automatically detect all workspace API keys
  return Object.entries(process.env)
    .filter(([key, value]) => 
      key.startsWith('NOTION_') && 
      key.endsWith('_API_KEY') && 
      value && 
      key !== 'NOTION_API_KEY' // Exclude primary key
    )
    .map(([key]) => 
      key.replace('NOTION_', '').replace('_API_KEY', '').toLowerCase()
    );
}
