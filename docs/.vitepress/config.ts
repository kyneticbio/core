import { defineConfig } from "vitepress";
import path from "path";
import katex from "markdown-it-katex";

export default defineConfig({
  title: "KyneticBio",
  description: "Physiological Simulation Engine Documentation",
  base: "/core/",
  head: [
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css",
      },
    ],
  ],
  markdown: {
    config: (md) => {
      md.use(katex);
    },
  },
  vite: {
    resolve: {
      alias: {
        "@kyneticbio/core": path.resolve(__dirname, "../../src/index.ts"),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Science", link: "/guide/science" },
      { text: "Kynetic Studio", link: "https://physim.jeffjassky.com" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Core Concepts", link: "/guide/concepts" },
          { text: "Scientific Reference", link: "/guide/science" },
          { text: "Interactive Demo", link: "/demo" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "Subject", link: "/reference/subject" },
          { text: "System", link: "/reference/system" },
          { text: "Signal", link: "/reference/signals" },
          { text: "Condition", link: "/reference/conditions" },
          { text: "Intervention", link: "/reference/interventions" },
          { text: "Agent", link: "/reference/agents" },
          { text: "Mechanism", link: "/reference/mechanisms" },
        ],
      },
      {
        text: "Contributing",
        items: [
          { text: "Development Setup", link: "/contributing/" },
          { text: "Testing Standards", link: "/contributing/testing" }
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/kyneticbio/core" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright:
        'Made with love by <a href="https://github.com/jeffjassky">@jeffjassky</a>',
    },
  },
});
