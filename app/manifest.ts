import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Markdown Website",
    short_name: "Markdown Website",
    description: "Read your website in markdown",
    start_url: "/",
    display: "standalone",
    background_color: "#000",
    theme_color: "#000",
  };
}
