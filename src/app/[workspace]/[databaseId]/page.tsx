import { notFound } from "next/navigation";
import Link from "next/link";
import { getDatabaseById, getDatabaseItems } from "@/lib/notion-discovery";
import { getDatabaseConfig, getWorkspaceIcon, ResolvedRelation } from "@/types/database";
import { ArrowRight, FileText, Calendar, Tag, Link2 } from "lucide-react";

interface PageProps {
  params: {
    workspace: string;
    databaseId: string;
  };
}

export default async function WorkspaceDatabasePage({ params }: PageProps) {
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

  const items = await getDatabaseItems(databaseId, 25, true); // Reduced page size for faster loading
  const config = getDatabaseConfig(database.type);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Navigation */}
      <nav className="mb-8">
        <Link 
          href={`/${workspaceType}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight size={14} className="rotate-180" />
          Back to {workspaceType === "gate-ec" ? "Gate EC" : workspaceType === "ml" ? "ML" : "Personal"}
        </Link>
      </nav>

      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg">
            {getWorkspaceIcon(workspaceType)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{database.title}</h1>
            <p className="text-sm text-muted-foreground">
              {workspaceType === "gate-ec" ? "Gate EC" : workspaceType === "ml" ? "ML" : "Personal"} • {database.type} • {items.length} items
            </p>
          </div>
        </div>
        
        {database.description && (
          <p className="text-muted-foreground leading-relaxed">
            {database.description}
          </p>
        )}
      </section>

      {/* Items */}
      <section>
        <div className="space-y-6">
          {items.map((item) => (
            <DatabaseItemCard key={item.id} item={item} config={config} workspaceType={workspaceType} />
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground">
                This database doesn't have any items yet, or they might not be visible to your integration.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DatabaseItemCard({ item, config, workspaceType }: { 
  item: any; 
  config: any; 
  workspaceType: string;
}) {
  const title = item.title || "Untitled";
  const metadata = extractMetadata(item.properties);
  const relations = item.resolvedRelations as ResolvedRelation[] | undefined;

  return (
    <div className="group border border-border rounded-lg p-6 hover:border-accent transition-colors">
      {/* Title */}
      <h3 className="text-lg font-medium group-hover:text-accent transition-colors mb-3">
        <Link href={`/${workspaceType}/${item.databaseId}/${item.id}`}>
          {title}
        </Link>
      </h3>

      {/* Property badges */}
      {metadata.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {metadata.map((meta) => (
            <span
              key={meta.name}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                meta.color ? `bg-${meta.color}/10 text-${meta.color}` : 'bg-muted text-muted-foreground'
              }`}
            >
              <span className="font-medium">{meta.name}:</span> {meta.value}
            </span>
          ))}
        </div>
      )}

      {/* Relation navigation chips */}
      {relations && relations.length > 0 && (
        <div className="space-y-2 mt-3 pt-3 border-t border-border">
          {relations.map((rel) => (
            <div key={rel.propertyName} className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Link2 size={10} />
                {rel.propertyName}:
              </span>
              {rel.items.map((relItem) => (
                <Link
                  key={relItem.id}
                  href={relItem.databaseId 
                    ? `/${workspaceType}/${relItem.databaseId}/${relItem.id}` 
                    : `#`}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  {relItem.title}
                  <ArrowRight size={10} />
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MetadataItem {
  name: string;
  value: string;
  color?: string;
}

function extractMetadata(properties: Record<string, any>): MetadataItem[] {
  const metadata: MetadataItem[] = [];
  
  for (const [key, value] of Object.entries(properties || {})) {
    const prop = value as any;
    
    // Skip title and relation properties — handled separately
    if (prop.type === "title" || prop.type === "relation") continue;
    
    if (prop.type === "number" && prop.number !== null && prop.number !== undefined) {
      metadata.push({ name: key, value: String(prop.number) });
    }
    
    if (prop.type === "select" && prop.select?.name) {
      const colorMap: Record<string, string> = {
        "High": "red", "Medium": "yellow", "Low": "green",
        "Not Started": "gray", "In Progress": "blue", "Done": "green",
        "Easy": "green", "Hard": "red",
      };
      metadata.push({ 
        name: key, 
        value: prop.select.name,
        color: colorMap[prop.select.name],
      });
    }
    
    if (prop.type === "multi_select" && prop.multi_select?.length > 0) {
      metadata.push({ 
        name: key, 
        value: prop.multi_select.map((s: any) => s.name).join(", "),
      });
    }
    
    if (prop.type === "checkbox") {
      metadata.push({ 
        name: key, 
        value: prop.checkbox ? "Yes" : "No",
        color: prop.checkbox ? "green" : "gray",
      });
    }
    
    if (prop.type === "date" && prop.date?.start) {
      metadata.push({ name: key, value: formatDate(prop.date.start) });
    }
    
    if (prop.type === "rich_text" && prop.rich_text?.length > 0) {
      const text = prop.rich_text.map((t: any) => t.plain_text).join("");
      if (text.length <= 100) {
        metadata.push({ name: key, value: text });
      }
    }
    
    if (prop.type === "status" && prop.status?.name) {
      const colorMap: Record<string, string> = {
        "Not started": "gray", "In progress": "blue", "Done": "green",
      };
      metadata.push({ 
        name: key, 
        value: prop.status.name,
        color: colorMap[prop.status.name],
      });
    }
  }
  
  return metadata;
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
