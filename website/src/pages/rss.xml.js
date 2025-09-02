import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function GET(context) {
  const blog = await getCollection("blogPosts");
  const sortedBlog = blog.sort(
    (a, b) => new Date(b.data.lastUpdatedAt) - new Date(a.data.lastUpdatedAt),
  );
  return rss({
    title: "Patron.com Blog",
    description:
      "The latest updates, insights, and stories from Patron - the creator-first platform empowering artists, writers, and creators with low fees and open-source transparency.",
    site: context.site,
    items: sortedBlog
      .filter(
        (post) =>
          !(post.data.isDraft ?? false) &&
          !post.data.categories?.includes("changelog"),
      )
      .map((post) => ({
        link: `/blog/${post.id}/`,
        content: sanitizeHtml(parser.render(post.body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        }),
        pubDate: post.data.lastUpdatedAt,
        ...post.data,
      })),
    customData: `<language>en-us</language>`,
  });
}
