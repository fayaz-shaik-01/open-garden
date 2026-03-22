import { notFound } from "next/navigation";
import Link from "next/link";
import { getDatabaseById, getDatabaseItemById } from "@/lib/notion-discovery";
import { getDatabaseConfig, getWorkspaceIcon, ResolvedRelation } from "@/types/database";
import { ArrowRight, FileText, Calendar, Tag, Link2, ExternalLink } from "lucide-react";

interface PageProps {
  params: {
    workspace: string;
    databaseId: string;
    id: string;
  };
}

export default async function WorkspaceDatabaseItemPage({ params }: PageProps) {
  const workspaceType = params.workspace;
  const databaseId = params.databaseId;
  
  // Validate workspace exists (simple validation without fetching all databases)
  const validWorkspaces = ['gate_ec', 'ml', 'personal'];
  if (!validWorkspaces.includes(workspaceType)) {
    notFound();
  }

  // Get database info directly (cached) instead of fetching all databases
  const database = await getDatabaseById(databaseId, workspaceType);
  
  if (!database) {
    notFound();
  }

  const item = await getDatabaseItemById(databaseId, params.id, true, true);
  
  if (!item) {
    notFound();
  }

  const config = getDatabaseConfig(database.type);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Navigation */}
      <nav className="mb-8">
        <Link 
          href={`/${workspaceType}/${params.databaseId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={14} className="rotate-180" />
          Back to {database.title}
        </Link>
      </nav>

      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg">
            {getWorkspaceIcon(workspaceType)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              {workspaceType === "gate-ec" ? "Gate EC" : workspaceType === "ml" ? "ML" : "Personal"} • {database.title}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {item.content && item.content.length > 0 && (
        <section className="mb-12">
          <NotionBlocks blocks={item.content} workspaceType={workspaceType} item={item} />
        </section>
      )}

      {/* Actions */}
      <section>
        <div className="flex items-center gap-4">
          <Link
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            <ExternalLink size={16} />
            Open in Notion
          </Link>
        </div>
      </section>
    </div>
  );
}

function PropertyList({ properties }: { properties: Record<string, any> }) {
  const entries = Object.entries(properties || {});
  
  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        const prop = value as any;
        
        // Skip title property - it's already in the header
        if (prop.type === "title") return null;
        
        return (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{key}</span>
            <PropertyValue value={prop} />
          </div>
        );
      })}
      
      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">No properties found</p>
      )}
    </div>
  );
}

function PropertyValue({ value }: { value: any }) {
  const prop = value as any;
  
  switch (prop.type) {
    case "rich_text":
      if (prop.rich_text?.length > 0) {
        return (
          <div className="prose prose-sm max-w-none">
            {prop.rich_text.map((t: any, i: number) => (
              <span key={i}>{t.plain_text}</span>
            ))}
          </div>
        );
      }
      return <span className="text-sm">-</span>;
      
    case "title":
      if (prop.title?.length > 0) {
        return <span className="text-sm">{prop.title.map((t: any) => t.plain_text).join("")}</span>;
      }
      return <span className="text-sm">-</span>;
      
    case "select":
      return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
          getSelectColor(prop.select?.name)
        }`}>
          {prop.select?.name || "-"}
        </span>
      );
      
    case "multi_select":
      return (
        <div className="flex flex-wrap gap-1">
          {prop.multi_select?.map((option: any) => (
            <span key={option.id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted">
              {option.name}
            </span>
          ))}
        </div>
      );
      
    case "number":
      return <span className="text-sm font-mono">{prop.number ?? "-"}</span>;
      
    case "checkbox":
      return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
          prop.checkbox ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {prop.checkbox ? "Yes" : "No"}
        </span>
      );
      
    case "date":
      return <span className="text-sm">{prop.date?.start ? formatDate(prop.date.start) : "-"}</span>;
      
    case "status":
      return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
          getStatusColor(prop.status?.name)
        }`}>
          {prop.status?.name || "-"}
        </span>
      );
      
    case "url":
      return prop.url ? (
        <a
          href={prop.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          {prop.url}
          <ExternalLink size={12} />
        </a>
      ) : (
        <span className="text-sm">-</span>
      );
      
    case "email":
      return prop.email ? (
        <a
          href={`mailto:${prop.email}`}
          className="text-sm text-accent hover:underline"
        >
          {prop.email}
        </a>
      ) : (
        <span className="text-sm">-</span>
      );
      
    case "phone":
      return <span className="text-sm">{prop.phone ?? "-"}</span>;
      
    default:
      return <span className="text-sm text-muted-foreground">Unsupported property type: {prop.type}</span>;
  }
}

function RelationSection({ relation, workspaceType }: { 
  relation: ResolvedRelation; 
  workspaceType: string;
}) {
  if (relation.items.length === 0) return null;
  
  return (
    <div className="border border-border rounded-lg p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
        <Link2 size={14} />
        {relation.propertyName} ({relation.items.length})
      </h3>
      <div className="space-y-2">
        {relation.items.map((item) => (
          <Link
            key={item.id}
            href={item.databaseId 
              ? `/${workspaceType}/${item.databaseId}/${item.id}` 
              : `#`}
            className="block p-2 rounded-md bg-muted hover:bg-accent/10 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm group-hover:text-accent transition-colors">
                {item.title}
              </span>
              <ArrowRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function getSelectColor(name?: string): string {
  if (!name) return "bg-muted";
  
  const colorMap: Record<string, string> = {
    "High": "bg-red-100 text-red-800",
    "Medium": "bg-yellow-100 text-yellow-800", 
    "Low": "bg-green-100 text-green-800",
    "Not Started": "bg-gray-100 text-gray-800",
    "In Progress": "bg-blue-100 text-blue-800",
    "Done": "bg-green-100 text-green-800",
    "Easy": "bg-green-100 text-green-800",
    "Hard": "bg-red-100 text-red-800",
  };
  
  return colorMap[name] || "bg-muted";
}

function getStatusColor(name?: string): string {
  if (!name) return "bg-muted";
  
  const colorMap: Record<string, string> = {
    "Not started": "bg-gray-100 text-gray-800",
    "In progress": "bg-blue-100 text-blue-800",
    "Done": "bg-green-100 text-green-800",
  };
  
  return colorMap[name] || "bg-muted";
}

function extractMainContent(properties: Record<string, any>): string | null {
  // Look for rich_text content in common property names
  const contentPropertyNames = [
    "Content", "Description", "Details", "Solution", "Explanation", 
    "Answer", "Notes", "Summary", "Body", "Text"
  ];
  
  // First try specific content property names
  for (const propName of contentPropertyNames) {
    const prop = properties[propName];
    if (prop?.type === "rich_text" && prop.rich_text?.length > 0) {
      const text = prop.rich_text.map((t: any) => t.plain_text).join("");
      if (text.trim()) return text;
    }
  }
  
  // Then look for any rich_text property (but exclude common non-content fields)
  for (const [propName, prop] of Object.entries(properties || {})) {
    const propValue = prop as any;
    if (propValue?.type === "rich_text" && propValue?.rich_text?.length > 0) {
      // Skip property names that are likely not main content
      const skipNames = ["Difficulty", "Priority", "Status", "Mistake Type", "Time Taken"];
      if (skipNames.includes(propName)) continue;
      
      const text = propValue.rich_text.map((t: any) => t.plain_text).join("");
      if (text.trim() && text.length > 10) { // Only return substantial content
        return text;
      }
    }
  }
  
  return null;
}

function NotionBlocks({ blocks, workspaceType, item }: { blocks: any[]; workspaceType: string; item: any }) {
  if (!blocks || blocks.length === 0) return null;

  // Track used relations across all blocks to avoid duplicates
  const usedRelations = new Set<any>();

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => (
        <NotionBlock key={block.id || index} block={block} workspaceType={workspaceType} item={item} usedRelations={usedRelations} />
      ))}
    </div>
  );
}

function NotionBlock({ block, workspaceType, item, usedRelations }: { block: any; workspaceType: string; item: any; usedRelations: Set<any> }) {
  const type = block.type;
  const content = block[type];

  // Debug: Log unknown block types
  if (!["paragraph", "heading_1", "heading_2", "heading_3"].includes(type)) {
    console.log(`🔍 Rendering block type: ${type}`, content);
  }

  switch (type) {
    case "paragraph":
      return (
        <p className="mb-4">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
              {text.plain_text}
            </span>
          ))}
        </p>
      );

    case "heading_1":
      return (
        <h1 className="text-2xl font-bold mb-4">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
              {text.plain_text}
            </span>
          ))}
        </h1>
      );

    case "heading_2":
      return (
        <h2 className="text-xl font-semibold mb-3">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
              {text.plain_text}
            </span>
          ))}
        </h2>
      );

    case "heading_3":
      return (
        <h3 className="text-lg font-semibold mb-2">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
              {text.plain_text}
            </span>
          ))}
        </h3>
      );

    case "bulleted_list_item":
      return (
        <li className="ml-4">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
              {text.plain_text}
            </span>
          ))}
        </li>
      );

    case "numbered_list_item":
      return (
        <li className="ml-4 list-decimal">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
              {text.plain_text}
            </span>
          ))}
        </li>
      );

    case "code":
      return (
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
          <code>{content?.rich_text?.map((text: any) => text.plain_text).join("")}</code>
        </pre>
      );

    case "quote":
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic">
          {content?.rich_text?.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </blockquote>
      );

    case "divider":
      return <hr className="my-6" />;

    case "equation":
      return (
        <div className="my-4 p-4 bg-gray-50 rounded-md text-center">
          <code className="text-lg">{content?.expression}</code>
        </div>
      );

    case "callout":
      return (
        <div className={`mb-4 p-4 rounded-md border-l-4 ${
          content?.icon?.emoji === "📝" ? "bg-blue-50 border-blue-300" : 
          content?.icon?.emoji === "⚠️" ? "bg-yellow-50 border-yellow-300" :
          "bg-gray-50 border-gray-300"
        }`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">{content?.icon?.emoji}</span>
            <div>
              {content?.rich_text?.map((text: any, i: number) => (
                <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
                  {text.plain_text}
                </span>
              ))}
            </div>
          </div>
        </div>
      );

    case "toggle":
      return (
        <details className="mb-4 border border-gray-200 rounded-md">
          <summary className="px-4 py-2 bg-gray-50 cursor-pointer font-medium">
            {content?.rich_text?.map((text: any) => text.plain_text).join("")}
          </summary>
          <div className="p-4">
            {content?.children?.map((child: any, i: number) => (
              <NotionBlock key={i} block={child} workspaceType={workspaceType} item={item} usedRelations={usedRelations} />
            ))}
          </div>
        </details>
      );

    case "to_do":
      return (
        <div className="flex items-center gap-2 mb-2">
          <input 
            type="checkbox" 
            checked={content?.checked} 
            readOnly 
            className="rounded"
          />
          <span>
            {content?.rich_text?.map((text: any, i: number) => (
              <span key={i} className={text.annotations?.bold ? "font-bold" : text.annotations?.italic ? "italic" : ""}>
                {text.plain_text}
              </span>
            ))}
          </span>
        </div>
      );

    case "child_database":
      // These are filtered views - render them as embedded navigation sections
      const viewId = block.id || content?.database_id || "";
      const viewTitle = content?.title || 
                       (content?.rich_text && content.rich_text[0]?.plain_text) || 
                       "Filtered View";
      
      // Get the related items for this view type from the resolved relations
      const getRelatedItemsForView = (viewTitle: string, viewIndex: number, usedRelations: Set<any>) => {
        if (!item.resolvedRelations) return [];
        
        // Try exact match first
        let relation = item.resolvedRelations.find((r: any) => 
          r.propertyName.toLowerCase() === viewTitle.toLowerCase()
        );
        
        // If no exact match, try to infer the type from common patterns
        if (!relation) {
          // For "Untitled" views, try to match by position or common database types
          if (viewTitle.toLowerCase().includes('untitled')) {
            const relations = item.resolvedRelations;
            
            // Get available database types from the resolved relations property names
            // This makes it dynamic based on what's actually available in Notion
            const availableTypes = item.resolvedRelations?.map((r: any) => 
              r.propertyName.toLowerCase()
            ) || [];
            
            // Common fallback types if no relations found
            const fallbackTypes = ['notes', 'projects', 'tasks'];
            const commonTypes = availableTypes.length > 0 ? availableTypes : fallbackTypes;
            
            // Try to match by common database names, but skip already used ones
            for (const type of commonTypes) {
              const candidateRelation = relations.find((r: any) => 
                r.propertyName.toLowerCase() === type.toLowerCase() && !usedRelations.has(r)
              );
              if (candidateRelation) {
                relation = candidateRelation;
                break;
              }
            }
            
            // If still no match, use the view index to pick an unused relation
            if (!relation) {
              const availableRelations = relations.filter((r: any) => !usedRelations.has(r));
              if (availableRelations.length > viewIndex) {
                relation = availableRelations[viewIndex];
              } else if (availableRelations.length > 0) {
                relation = availableRelations[0];
              }
            }
          }
        }
        
        // Mark this relation as used
        if (relation) {
          usedRelations.add(relation);
        }
        
        return relation?.items || [];
      };
      
      // Get the view index to help with matching
      const viewIndex = item.content?.indexOf(block) || 0;
      const relatedItems = getRelatedItemsForView(viewTitle, viewIndex, usedRelations);
      
      // Get a better display title based on the relation type
      const getDisplayTitle = (viewTitle: string, relatedItems: any[]) => {
        if (relatedItems.length > 0) {
          // Infer the title from the relation type
          const relation = item.resolvedRelations?.find((r: any) => r.items === relatedItems);
          if (relation) {
            return relation.propertyName;
          }
        }
        
        // Fallback to view title
        return viewTitle;
      };
      
      const displayTitle = getDisplayTitle(viewTitle, relatedItems);
      
      return (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl p-6 border border-accent/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold">
                  {getIconForDatabaseType(displayTitle)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-accent">{displayTitle}</h3>
                  <p className="text-sm text-muted-foreground">{relatedItems.length} items available</p>
                </div>
              </div>
              {relatedItems.length > 0 && (
                <div className="text-accent font-medium">
                  Explore →
                </div>
              )}
            </div>
            
            {relatedItems.length > 0 ? (
              <div className="grid gap-3">
                {relatedItems.map((relatedItem: any) => (
                  <Link
                    key={relatedItem.id}
                    href={relatedItem.databaseId 
                      ? `/${workspaceType}/${relatedItem.databaseId}/${relatedItem.id}` 
                      : "#"}
                    className="group bg-white rounded-lg p-4 border border-gray-200 hover:border-accent hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-accent transition-colors mb-1">
                          {relatedItem.title}
                        </div>
                        {relatedItem.databaseType && (
                          <div className="text-xs text-muted-foreground">
                            {relatedItem.databaseType}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-muted-foreground">View details</span>
                        <ArrowRight size={16} className="text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📭</div>
                <p>No items found for this subject</p>
              </div>
            )}
          </div>
        </div>
      );

    default:
      // Fallback for unknown block types - show more detailed info
      return (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 font-medium">Unsupported block type: {type}</p>
          <div className="mt-2 text-xs text-yellow-700">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        </div>
      );
  }
}

function getIconForDatabaseType(displayTitle: string): string {
  // Dynamic icon mapping based on common database title patterns
  const title = displayTitle.toLowerCase();
  
  // Academic/Learning related
  if (title.includes('pyq') || title.includes('question') || title.includes('exam')) return '📝';
  if (title.includes('topic') || title.includes('subject') || title.includes('concept')) return '�';
  if (title.includes('note') || title.includes('revision') || title.includes('study')) return '📖';
  if (title.includes('tracker') || title.includes('progress') || title.includes('revision')) return '📊';
  
  // Research/ML related  
  if (title.includes('project') || title.includes('experiment')) return '🤖';
  if (title.includes('paper') || title.includes('research') || title.includes('article')) return '📄';
  if (title.includes('dataset') || title.includes('data')) return '📈';
  if (title.includes('model') || title.includes('algorithm') || title.includes('ml')) return '🧠';
  if (title.includes('experiment') || title.includes('lab') || title.includes('test')) return '🔬';
  
  // Personal/Productivity related
  if (title.includes('task') || title.includes('todo') || title.includes('checklist')) return '✅';
  if (title.includes('bookmark') || title.includes('link') || title.includes('resource')) return '🔖';
  if (title.includes('idea') || title.includes('thought') || title.includes('inspiration')) return '💡';
  
  // General purpose
  if (title.includes('note')) return '📝';
  if (title.includes('project')) return '💼';
  
  // Default icon
  return '📋';
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
