import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { getAllPosts } from "@/lib/mdx";
import { getNotes } from "@/lib/notion";
import { getProjects } from "@/lib/notion";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const posts = getAllPosts().slice(0, 5);
  const notes = await getNotes();
  const projects = await getProjects();
  const recentNotes = notes.slice(0, 3);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

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

      {/* Writing */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Writing
          </h2>
          <Link
            href="/writing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            All posts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-1">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/writing/${post.slug}`}
              className="flex items-baseline justify-between gap-4 py-2 group"
            >
              <span className="text-sm group-hover:text-accent transition-colors truncate">
                {post.title}
              </span>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>

      {/* Notes */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Notes
          </h2>
          <Link
            href="/notes"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            All notes <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          {recentNotes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="block py-2 group"
            >
              <span className="text-sm font-medium group-hover:text-accent transition-colors">
                {note.title}
              </span>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {note.content}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            All projects <ArrowRight size={14} />
          </Link>
        </div>
        <div className="space-y-4">
          {featuredProjects.map((project) => (
            <div key={project.id} className="group">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium group-hover:text-accent transition-colors">
                    <Link href={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {project.stack.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
