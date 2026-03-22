import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar, Tag } from "lucide-react";
import { getAllDatabases, getDatabaseItemById } from "@/lib/notion-discovery";
import { getDatabaseConfig, getDatabaseTypePath } from "@/types/database";

interface PageProps {
  params: {
    databaseId: string;
    id: string;
  };
}

export default async function DatabaseItemPage({ params }: PageProps) {
  const databases = await getAllDatabases();
  const database = databases.find(db => db.id === params.databaseId);
  
  if (!database) {
    notFound();
  }

  const item = await getDatabaseItemById(params.databaseId, params.id);
  
  if (!item) {
    notFound();
  }

  const config = getDatabaseConfig(database.type);
  const properties = formatProperties(item.properties);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Navigation */}
      <nav className="mb-8">
        <Link 
          href={`/db/${params.databaseId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          Back to {database.title}
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg">
            {config.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              {database.title} • {getDatabaseTypePath(database.type)}
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="space-y-8">
        {properties.map((prop, index) => (
          <PropertySection key={index} property={prop} />
        ))}
        
        {properties.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">📄</div>
            </div>
            <h3 className="text-lg font-medium mb-2">No content available</h3>
            <p className="text-sm text-muted-foreground">
              This item doesn't have any visible content or the properties might not be accessible.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            Created: {formatDate(item.created_time)}
          </div>
          <div>
            Last modified: {formatDate(item.last_edited_time)}
          </div>
        </div>
        
        <div className="mt-4">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View in Notion <ExternalLink size={12} />
          </a>
        </div>
      </footer>
    </div>
  );
}

interface PropertySectionProps {
  property: {
    name: string;
    value: string | string[] | null;
    type: string;
  };
}

function PropertySection({ property }: PropertySectionProps) {
  if (!property.value) return null;

  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {property.name}
      </h3>
      
      <div className="prose prose-sm max-w-none">
        {Array.isArray(property.value) ? (
          <div className="flex flex-wrap gap-2">
            {property.value.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {property.type === "url" ? (
              <a
                href={property.value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline inline-flex items-center gap-1"
              >
                {property.value} <ExternalLink size={12} />
              </a>
            ) : (
              property.value
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function formatProperties(properties: Record<string, any>) {
  const formatted = [];

  for (const [key, value] of Object.entries(properties)) {
    if (!value) continue;

    let formattedValue: string | string[] | null = null;
    let type = "text";

    // Title property
    if (value.title?.length) {
      formattedValue = value.title.map((t: any) => t.plain_text).join("");
      type = "title";
    }
    // Rich text property
    else if (value.rich_text?.length) {
      formattedValue = value.rich_text.map((t: any) => t.plain_text).join("");
      type = "text";
    }
    // Select property
    else if (value.select?.name) {
      formattedValue = value.select.name;
      type = "select";
    }
    // Multi-select property
    else if (value.multi_select?.length) {
      formattedValue = value.multi_select.map((s: any) => s.name);
      type = "multi_select";
    }
    // Date property
    else if (value.date?.start) {
      formattedValue = value.date.start;
      type = "date";
    }
    // URL property
    else if (value.url) {
      formattedValue = value.url;
      type = "url";
    }
    // Checkbox property
    else if (typeof value.checkbox === "boolean") {
      formattedValue = value.checkbox ? "Yes" : "No";
      type = "checkbox";
    }
    // Number property
    else if (typeof value.number === "number") {
      formattedValue = value.number.toString();
      type = "number";
    }
    // Email property
    else if (value.email) {
      formattedValue = value.email;
      type = "email";
    }
    // Phone property
    else if (value.phone) {
      formattedValue = value.phone;
      type = "phone";
    }

    if (formattedValue) {
      formatted.push({
        name: formatPropertyName(key),
        value: formattedValue,
        type,
      });
    }
  }

  return formatted;
}

function formatPropertyName(name: string): string {
  // Convert snake_case or kebab-case to Title Case
  return name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
