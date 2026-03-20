import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/mdx";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Blog posts about engineering, design, and technology.",
};

export default function WritingPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Writing</h1>
      <p className="text-muted-foreground text-sm mb-8">
        Long-form thoughts on engineering, design, and building products.
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-xs text-muted-foreground">Filter:</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Posts */}
      <div className="divide-y divide-border">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/writing/${post.slug}`}
            className="block py-5 group"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-medium group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              <time className="text-xs text-muted-foreground shrink-0">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </div>
            {post.summary && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                {post.summary}
              </p>
            )}
            {post.tags.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No posts yet. Check back soon!
        </p>
      )}
    </div>
  );
}
