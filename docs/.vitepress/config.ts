import { defineConfig } from "vitepress";
import path from "path";

export default defineConfig({
  title: "KyneticBio Core",
  description: "Physiological Simulation Engine Documentation",
  base: "/core/",
  vite: {
    resolve: {
      alias: {
        "@kyneticbio/core": path.resolve(__dirname, "../../src/index.ts"),
      },
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/subject' },
      { text: 'Contributing', link: '/contributing/' },
      { text: 'Kynetic Studio', link: 'https://physim.jeffjassky.com' }
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
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
        items: [{ text: "Development Setup", link: "/contributing/" }],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kyneticbio/core' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Made with love by <a href="https://github.com/jeffjassky">@jeffjassky</a>'
    }
  }
})
