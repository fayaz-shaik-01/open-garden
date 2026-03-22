export const siteConfig = {
  name: "Shahbaz Fayaz",
  title: "Shahbaz Fayaz — Software Engineer",
  description:
    "Software engineer building products for the web. Writing about engineering, design, and technology.",
  url: "https://shahbazfayaz.com",
  ogImage: "/og.png",
  role: "Software Engineer",
  bio: "I'm a software engineer who loves building products that make a difference. Currently focused on full-stack development, distributed systems, and developer tools.",
  location: "India",
  email: "hello@shahbazfayaz.com",
  social: {
    github: "https://github.com/shahbazfayaz",
    twitter: "https://twitter.com/shahbazfayaz",
    linkedin: "https://linkedin.com/in/shahbazfayaz",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
  ],
};

export type NavItem = (typeof siteConfig.nav)[number];
