import type { MDXRemoteProps } from "next-mdx-remote";

export const mdxComponents: MDXRemoteProps["components"] = {
  h1: (props) => (
    <h1
      className="text-2xl font-bold tracking-tight mt-8 mb-4"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-xl font-semibold tracking-tight mt-8 mb-3"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-lg font-semibold tracking-tight mt-6 mb-2"
      {...props}
    />
  ),
  p: (props) => (
    <p className="leading-7 mb-4" {...props} />
  ),
  a: (props) => (
    <a
      className="text-accent underline underline-offset-4 hover:opacity-80 transition-opacity"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  ul: (props) => (
    <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
  ),
  li: (props) => (
    <li className="leading-7" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-border pl-4 italic text-muted-foreground mb-4"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-8" />,
  code: (props) => (
    <code
      className="bg-muted rounded px-1.5 py-0.5 text-sm font-mono"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="bg-muted rounded-lg p-4 overflow-x-auto mb-4 text-sm"
      {...props}
    />
  ),
  img: (props) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="rounded-lg my-6"
      alt={props.alt || ""}
      {...props}
    />
  ),
};
