import Link from "next/link";
import { getAllDatabases } from "@/lib/notion-discovery";
import { getDatabaseConfig, getDatabaseTypePath } from "@/types/database";
import { ArrowRight, Database } from "lucide-react";

export default async function DatabasesPage() {
  const databases = await getAllDatabases();

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg">
            <Database size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">All Databases</h1>
            <p className="text-sm text-muted-foreground">
              {databases.length} databases available
            </p>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          Browse through all your Notion databases. Each database is automatically discovered and categorized based on its content structure.
        </p>
      </section>

      {/* Database Grid */}
      <section>
        <div className="grid gap-4">
          {databases.map((database) => {
            const config = getDatabaseConfig(database.type);
            return (
              <DatabaseCard key={database.id} database={database} config={config} />
            );
          })}
          
          {databases.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Database className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No databases found</h3>
              <p className="text-sm text-muted-foreground">
                Make sure your Notion integration has access to at least one database, and that the databases are shared with your integration.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

interface DatabaseCardProps {
  database: any;
  config: any;
}

function DatabaseCard({ database, config }: DatabaseCardProps) {
  return (
    <Link
      href={`/db/${database.id}`}
      className="block border border-border rounded-lg p-6 hover:border-accent transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg group-hover:bg-accent group-hover:text-white transition-colors">
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium group-hover:text-accent transition-colors">
                {database.title}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                {getDatabaseTypePath(database.type)}
              </span>
            </div>
            
            {database.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {database.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>
                Created: {formatDate(database.created_time)}
              </div>
              <div>
                Updated: {formatDate(database.last_edited_time)}
              </div>
            </div>
          </div>
        </div>
        
        <ArrowRight 
          size={16} 
          className="text-muted-foreground group-hover:text-accent transition-colors mt-1" 
        />
      </div>
    </Link>
  );
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
