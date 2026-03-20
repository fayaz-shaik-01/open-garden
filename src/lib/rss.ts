import { Feed } from "feed";
import { siteConfig } from "./config";
import { getAllPosts } from "./mdx";

export function generateRSSFeed(): string {
  const posts = getAllPosts();

  const feed = new Feed({
    title: siteConfig.name,
    description: siteConfig.description,
    id: siteConfig.url,
    link: siteConfig.url,
    language: "en",
    copyright: `All rights reserved ${new Date().getFullYear()}, ${siteConfig.name}`,
    author: {
      name: siteConfig.name,
      email: siteConfig.email,
      link: siteConfig.url,
    },
  });

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${siteConfig.url}/writing/${post.slug}`,
      link: `${siteConfig.url}/writing/${post.slug}`,
      description: post.summary,
      date: new Date(post.date),
    });
  });

  return feed.rss2();
}
