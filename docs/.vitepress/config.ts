import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "KyneticBio Core",
  description: "Physiological Simulation Engine Documentation",
  base: '/core/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Contributing', link: '/contributing/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Simulation Loop', link: '/guide/simulation' },
            { text: 'Pharmacokinetics (PK)', link: '/guide/pk' },
            { text: 'Pharmacodynamics (PD)', link: '/guide/pd' },
            { text: 'Signals & Systems', link: '/guide/signals' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Engine API', link: '/reference/engine' },
            { text: 'Signal Catalog', link: '/reference/signals' },
            { text: 'Condition Library', link: '/reference/conditions' },
            { text: 'Type Definitions', link: '/reference/types' }
          ]
        }
      ],
      '/contributing/': [
        {
          text: 'Contributing',
          items: [
            { text: 'Development Setup', link: '/contributing/' },
            { text: 'Testing Guide', link: '/contributing/testing' },
            { text: 'Adding Interventions', link: '/contributing/interventions' },
            { text: 'Release Process', link: '/contributing/release' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/kyneticbio/core' }
    ]
  }
})
