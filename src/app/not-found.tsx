import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">
        This page doesn&apos;t exist. Maybe it was moved or deleted.
      </p>
      <Link
        href="/"
        className="text-sm text-accent hover:opacity-80 transition-opacity"
      >
        Go home
      </Link>
    </div>
  );
}
