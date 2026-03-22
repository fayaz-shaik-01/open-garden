import { siteConfig } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About me, my journey, and what I do.",
};

const skills = [
  { category: "Languages", items: ["TypeScript", "JavaScript", "Python", "Go", "Rust", "SQL"] },
  { category: "Frontend", items: ["React", "Next.js", "Tailwind CSS", "HTML/CSS", "Vue.js"] },
  { category: "Backend", items: ["Node.js", "Express", "FastAPI", "PostgreSQL", "Redis"] },
  { category: "Tools", items: ["Git", "Docker", "AWS", "Vercel", "Figma", "Linux"] },
];

const experience = [
  {
    role: "Senior Software Engineer",
    company: "Tech Company",
    period: "2022 – Present",
    description:
      "Leading frontend architecture and building developer tools. Working on design systems, performance optimization, and developer experience.",
  },
  {
    role: "Software Engineer",
    company: "Startup",
    period: "2020 – 2022",
    description:
      "Built and shipped core product features from scratch. Led migration from REST to GraphQL, reducing API response times by 40%.",
  },
  {
    role: "Junior Developer",
    company: "Digital Agency",
    period: "2018 – 2020",
    description:
      "Developed client websites and web applications. Introduced automated testing practices to the team.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-[700px] mx-auto px-6 py-12 lg:py-16">
      {/* Header */}
      <section className="mb-16">
        <h1 className="text-2xl font-bold tracking-tight mb-4">About</h1>
        <div className="space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Hi, I&apos;m <span className="text-foreground font-medium">{siteConfig.name}</span>.
            I&apos;m a {siteConfig.role.toLowerCase()} based in {siteConfig.location}.
          </p>
          <p>
            I care deeply about building products that are fast, accessible, and delightful to use.
            I believe the best software comes from a deep understanding of both the technical
            challenges and the human needs behind them.
          </p>
          <p>
            When I&apos;m not coding, you&apos;ll find me reading about distributed systems,
            exploring new programming languages, or contributing to open source. I&apos;m always
            looking for opportunities to learn and grow.
          </p>
          <p>
            This website serves as my personal operating system — a place to organize my thoughts,
            share what I&apos;ve learned, and showcase the things I&apos;ve built.
          </p>
        </div>
      </section>

      {/* Skills */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Skills & Technologies
        </h2>
        <div className="grid grid-cols-2 gap-6">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h3 className="text-sm font-medium mb-2">{skillGroup.category}</h3>
              <div className="flex flex-wrap gap-1.5">
                {skillGroup.items.map((item) => (
                  <span
                    key={item}
                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
          Experience
        </h2>
        <div className="space-y-8">
          {experience.map((exp) => (
            <div key={exp.role + exp.company}>
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h3 className="text-sm font-medium">{exp.role}</h3>
                <span className="text-xs text-muted-foreground shrink-0">{exp.period}</span>
              </div>
              <p className="text-sm text-accent mb-1.5">{exp.company}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Get in Touch
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Feel free to reach out if you want to chat about technology, collaborate on a project,
          or just say hello.
        </p>
        <div className="flex items-center gap-4 text-sm">
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-accent hover:opacity-80 transition-opacity"
          >
            Email
          </a>
          <a
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-80 transition-opacity"
          >
            GitHub
          </a>
          <a
            href={siteConfig.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-80 transition-opacity"
          >
            Twitter
          </a>
          <a
            href={siteConfig.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-80 transition-opacity"
          >
            LinkedIn
          </a>
        </div>
      </section>
    </div>
  );
}
