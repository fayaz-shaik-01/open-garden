import Link from "next/link";
import { getProjects } from "@/lib/notion";
import { ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built and contributed to.",
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Projects</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Things I&apos;ve built, contributed to, and experimented with.
      </p>

      <div className="space-y-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group p-4 -mx-4 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium">
                    <Link
                      href={`/projects/${project.id}`}
                      className="group-hover:text-accent transition-colors"
                    >
                      {project.name}
                    </Link>
                  </h2>
                  {project.featured && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`${project.name} on GitHub`}
                  >
                    <Github size={14} />
                  </a>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`Visit ${project.name}`}
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No projects yet.
        </p>
      )}
    </div>
  );
}
