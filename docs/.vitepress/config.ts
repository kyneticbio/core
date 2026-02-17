import { defineConfig } from "vitepress";
import path from "path";
import katex from "markdown-it-katex";

export default defineConfig({
  title: "KyneticBio",
  description: "Prototype your biology before you commit. A flight simulator for supplements, medications, and lifestyle interventions.",
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
      { text: "The Science", link: "/guide/science" },
      { text: "Kynetic Studio", link: "https://physim.jeffjassky.com" },
      { text: "Discord", link: "https://discord.gg/FUqxCk8J" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Core Concepts", link: "/guide/concepts" },
          { text: "The Science", link: "/guide/science" },
          { text: "Try It Yourself", link: "/demo" },
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
          { text: "Testing Standards", link: "/contributing/testing" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/kyneticbio/core" },
      { icon: "discord", link: "https://discord.gg/FUqxCk8J" },
    ],
    search: {
      provider: "local",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright:
        'Made with love by <a href="https://github.com/jeffjassky">@jeffjassky</a>',
    },
  },
});
