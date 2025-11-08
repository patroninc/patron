export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Custom redirects
    if (url.pathname === "/blog/patron-fee-changes-2025" || url.pathname === "/blog/patron-fee-changes-2025/") {
      return Response.redirect(
        url.origin + "/blog/patreon-fee-changes-2025/",
        301,
      );
    }

    if (
      url.pathname !== "/" &&
      !url.pathname.endsWith("/") &&
      !/\.[a-zA-Z0-9]+$/.test(url.pathname)
    ) {
      return Response.redirect(
        url.origin + url.pathname + "/" + url.search,
        301,
      );
    }

    const acceptHeader = request.headers.get("accept") || "";

    const acceptTypes = acceptHeader.split(",");

    const plainIndex = acceptTypes.findIndex(
      (t) => t.includes("text/plain") || t.includes("text/markdown"),
    );
    const htmlIndex = acceptTypes.findIndex((t) => t.includes("text/html"));
    const prefersMarkdown =
      plainIndex !== -1 && (htmlIndex === -1 || plainIndex < htmlIndex);

    const tryServeContent = async (format) => {
      let contentType;

      if (format === "markdown") {
        if (url.pathname == "" || url.pathname == "/") {
          const sitemapResponse = await env.ASSETS.fetch(
            new Request(new URL("/sitemap-0.xml", request.url)),
          );
          if (sitemapResponse.ok) {
            const content = await sitemapResponse.text();
            return new Response(content, {
              headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600",
              },
            });
          }
        }

        contentType = "text/plain; charset=utf-8";
        let distPath = `/markdown${url.pathname}`;

        if (!distPath.endsWith(".md") && !distPath.endsWith("/")) {
          distPath += "/index.md";
        } else if (distPath.endsWith("/")) {
          distPath += "index.md";
        }

        // Handle root path
        if (url.pathname === "/") {
          distPath = "/markdown/index.md";
        }

        try {
          const response = await env.ASSETS.fetch(
            new Request(new URL(distPath, request.url)),
          );
          if (response.ok) {
            const content = await response.text();
            return new Response(content, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
              },
            });
          }
        } catch (error) {
          console.error(`Error fetching HTML file from ${distPath}:`, error);
        }
      } else {
        contentType = "text/html; charset=utf-8";
        let distPath = `/html${url.pathname}`;

        if (!distPath.endsWith(".html") && !distPath.endsWith("/")) {
          distPath += "/index.html";
        } else if (distPath.endsWith("/")) {
          distPath += "index.html";
        }

        // Handle root path
        if (url.pathname === "/") {
          distPath = "/html/index.html";
        }

        try {
          const response = await env.ASSETS.fetch(
            new Request(new URL(distPath, request.url)),
          );
          if (response.ok) {
            const content = await response.text();
            return new Response(content, {
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
              },
            });
          }
        } catch (error) {
          console.error(`Error fetching HTML file from ${distPath}:`, error);
        }
      }

      return null;
    };

    if (prefersMarkdown) {
      const markdownResponse = await tryServeContent("markdown");
      if (markdownResponse) return markdownResponse;

      const htmlResponse = await tryServeContent("html");
      if (htmlResponse) return htmlResponse;
    } else {
      const htmlResponse = await tryServeContent("html");
      if (htmlResponse) return htmlResponse;

      const markdownResponse = await tryServeContent("markdown");
      if (markdownResponse) return markdownResponse;
    }

    return await env.ASSETS.fetch(
      new Request(new URL("/html/404.html", request.url)),
    );
  },
};
