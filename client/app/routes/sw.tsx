import { type LoaderFunction } from "react-router";
import * as fs from "fs";
import * as path from "path";

export const loader: LoaderFunction = () => {
  const swPath = path.join(process.cwd(), "public", "sw.js");

  try {
    const swContent = fs.readFileSync(swPath, "utf8");

    return new Response(swContent, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new Response("// Service worker not found", {
      status: 404,
      headers: {
        "Content-Type": "application/javascript",
      },
    });
  }
};
