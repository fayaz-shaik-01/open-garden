import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { getAllDatabases } from "@/lib/notion-discovery";
import { getWorkspaceIcon, getWorkspaceLabel } from "@/types/database";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const databases = await getAllDatabases();
  
  // Group databases by workspace dynamically
  const databasesByWorkspace = databases.reduce((acc, db) => {
    if (!acc[db.workspace]) {
      acc[db.workspace] = [];
    }
    acc[db.workspace].push(db);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Hero */}
      <section className="mb-16">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg font-semibold mb-6">
          {siteConfig.name.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">
          {siteConfig.name}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {siteConfig.bio}
        </p>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href={siteConfig.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Twitter
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </section>

      
      {/* Dynamic Workspace Sections */}
      {Object.entries(databasesByWorkspace).map(([workspace, workspaceDatabases]) => (
        <section key={workspace} className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {getWorkspaceLabel(workspace)}
            </h2>
            <Link
              href={`/${workspace}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              All {getWorkspaceLabel(workspace)} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {workspaceDatabases.slice(0, 3).map((database: any) => (
              <Link
                key={database.id}
                href={`/${workspace}/${database.id}`}
                className="block py-2 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-sm">
                    {getWorkspaceIcon(workspace)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium group-hover:text-accent transition-colors">
                      {database.title}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {database.description || `${database.type} database`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase">
                    {database.type}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
