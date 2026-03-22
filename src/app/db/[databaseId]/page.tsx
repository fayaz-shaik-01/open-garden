import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllDatabases, getDatabaseItems } from "@/lib/notion-discovery";
import { getDatabaseTypePath, getDatabaseConfig } from "@/types/database";
import { ArrowRight, FileText, Calendar, Tag } from "lucide-react";

interface PageProps {
  params: {
    databaseId: string;
  };
}

export default async function DatabasePage({ params }: PageProps) {
  const databases = await getAllDatabases();
  const database = databases.find(db => db.id === params.databaseId);
  
  if (!database) {
    notFound();
  }

  const items = await getDatabaseItems(database.id);
  const config = getDatabaseConfig(database.type);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg">
            {config.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{database.title}</h1>
            <p className="text-sm text-muted-foreground">
              {getDatabaseTypePath(database.type)} • {items.length} items
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
            <DatabaseItemCard key={item.id} item={item} config={config} />
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

function DatabaseItemCard({ item, config }: { item: any; config: any }) {
  const title = item.title || "Untitled";
  const content = extractContent(item, config);
  const date = extractDate(item, config);
  const tags = extractTags(item, config);
  const url = extractUrl(item, config);

  return (
    <div className="group border border-border rounded-lg p-6 hover:border-accent transition-colors">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-medium group-hover:text-accent transition-colors mb-2">
            {url ? (
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {title}
              </a>
            ) : (
              <Link href={`/db/${item.databaseId}/${item.id}`}>
                {title}
              </Link>
            )}
          </h3>
          
          {content && (
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {content}
            </p>
          )}
        </div>
        
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent/80 transition-colors"
          >
            <ArrowRight size={16} />
          </a>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {date && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(date)}</span>
          </div>
        )}
        
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={12} />
            <span>{tags.slice(0, 3).join(", ")}</span>
            {tags.length > 3 && <span>+{tags.length - 3}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function extractContent(item: any, config: any): string | null {
  for (const [key, value] of Object.entries(item.properties)) {
    if ((value as any).rich_text?.length) {
      return (value as any).rich_text.map((t: any) => t.plain_text).join("");
    }
    if ((value as any).title?.length) {
      return (value as any).title.map((t: any) => t.plain_text).join("");
    }
  }
  return null;
}

function extractDate(item: any, config: any): string | null {
  for (const [key, value] of Object.entries(item.properties)) {
    if ((value as any).date?.start) {
      return (value as any).date.start;
    }
  }
  return null;
}

function extractTags(item: any, config: any): string[] | null {
  for (const [key, value] of Object.entries(item.properties)) {
    if ((value as any).multi_select?.length) {
      return (value as any).multi_select.map((s: any) => s.name);
    }
    if ((value as any).select?.name) {
      return [(value as any).select.name];
    }
  }
  return null;
}

function extractUrl(item: any, config: any): string | null {
  for (const [key, value] of Object.entries(item.properties)) {
    if ((value as any).url) {
      return (value as any).url;
    }
  }
  return null;
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
