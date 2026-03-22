import Link from "next/link";
import { getAllDatabases } from "@/lib/notion-discovery";
import { getWorkspaceIcon, getWorkspaceLabel } from "@/types/database";
import { ArrowRight } from "lucide-react";

interface PageProps {
  params: {
    workspace: string;
  };
}

export default async function WorkspacePage({ params }: PageProps) {
  const databases = await getAllDatabases();
  const workspaceType = params.workspace;
  
  // Get all available workspaces to validate
  const availableWorkspaces = Array.from(new Set(databases.map(db => db.workspace)));
  
  // Validate workspace exists
  if (!availableWorkspaces.includes(workspaceType)) {
    return (
      <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Workspace Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The workspace "{params.workspace}" does not exist or has no databases.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Available workspaces:</p>
          <div className="flex flex-wrap gap-2">
            {availableWorkspaces.map((workspace: string) => (
              <Link
                key={workspace}
                href={`/${workspace}`}
                className="px-3 py-1 bg-muted rounded-md text-sm hover:bg-accent transition-colors"
              >
                {getWorkspaceLabel(workspace)}
              </Link>
            ))}
          </div>
        </div>
        <Link href="/" className="text-accent hover:underline inline-block mt-6">
          Go back home
        </Link>
      </div>
    );
  }

  const workspaceDatabases = databases.filter((db: any) => db.workspace === workspaceType);

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Header */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white text-lg">
            {getWorkspaceIcon(workspaceType)}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {getWorkspaceLabel(workspaceType)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {workspaceDatabases.length} databases
            </p>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          {getWorkspaceDescription(workspaceType)}
        </p>
      </section>

      {/* Database Grid */}
      <section>
        <div className="grid gap-4">
          {workspaceDatabases.map((database: any) => (
            <DatabaseCard key={database.id} database={database} workspaceType={workspaceType} />
          ))}
          
          {workspaceDatabases.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">{getWorkspaceIcon(workspaceType)}</div>
              </div>
              <h3 className="text-lg font-medium mb-2">No {getWorkspaceLabel(workspaceType)} databases found</h3>
              <p className="text-sm text-muted-foreground">
                {getEmptyStateMessage(workspaceType)}
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
  workspaceType: string;
}

function DatabaseCard({ database, workspaceType }: DatabaseCardProps) {
  return (
    <Link
      href={`/${workspaceType}/${database.id}`}
      className="block border border-border rounded-lg p-6 hover:border-accent transition-colors group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg group-hover:bg-accent group-hover:text-white transition-colors">
            {getWorkspaceIcon(workspaceType)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-medium group-hover:text-accent transition-colors">
                {database.title}
              </h3>
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

function getWorkspaceDescription(workspace: string): string {
  const descriptions: Record<string, string> = {
    "gate-ec": "All your Gate EC preparation materials, including subjects, papers, solutions, and resources.",
    "ml": "Machine learning resources, papers, projects, and research materials.",
    "personal": "Personal projects, portfolio content, and general databases.",
    "unknown": "Databases and materials from this workspace."
  };
  
  return descriptions[workspace] || descriptions.unknown;
}

function getEmptyStateMessage(workspace: string): string {
  const messages: Record<string, string> = {
    "gate-ec": "Create databases in your Gate EC workspace or share them with your integration.",
    "ml": "Create databases in your ML workspace or share them with your integration.",
    "personal": "Create databases in your personal workspace or share them with your integration.",
    "unknown": "Create databases in this workspace or share them with your integration."
  };
  
  return messages[workspace] || messages.unknown;
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
