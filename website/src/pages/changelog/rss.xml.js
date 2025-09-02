import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
const parser = new MarkdownIt();

export async function GET(context) {
  const allPosts = await getCollection("blogPosts");
  const sortedPosts = allPosts.sort((a, b) => new Date(b.data.lastUpdatedAt) - new Date(a.data.lastUpdatedAt));
  const changelogPosts = sortedPosts
    .filter(
      (post) =>
        post.data.categories?.includes("changelog") && !post.data.isDraft,
    );

  return rss({
    title: "Patron.com Changelog",
    description:
      "Stay up to date with the latest features, improvements, and fixes to the Patron platform. These posts detail new functionality, bug fixes, and enhancements that make the creator economy experience better for everyone.",
    site: context.site,
    items: changelogPosts.map((post) => ({
      title: post.data.title,
      link: `/blog/post/${post.slug}/`,
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      }),
      pubDate: post.data.createdAt,
      ...post.data,
    })),
    customData: `<language>en-us</language>`,
  });
}
