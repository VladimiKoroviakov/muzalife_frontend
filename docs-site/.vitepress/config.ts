/**
 * VitePress configuration for the MuzaLife Frontend documentation site.
 *
 * Deployed to GitHub Pages via .github/workflows/deploy-docs.yml.
 * Live at: https://vladimikoroviakov.github.io/muzalife_frontend/
 */

import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'MuzaLife Frontend',
  description: 'Документація React SPA платформи MuzaLife',
  lang: 'uk',
  base: '/muzalife_frontend/',

  head: [
    ['meta', { name: 'theme-color', content: '#646cff' }],
  ],

  locales: {
    root: {
      label: 'Українська',
      lang: 'uk',
      title: 'MuzaLife Frontend',
      description: 'Документація React SPA',
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'MuzaLife Frontend',
      description: 'React SPA documentation for MuzaLife platform',
      themeConfig: {
        nav: [
          { text: 'Guide',    link: '/en/guide/getting-started' },
          { text: 'TypeDoc',  link: '/typedoc/', target: '_blank' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/en/guide/getting-started' },
              { text: 'Architecture',    link: '/en/guide/architecture' },
            ],
          },
        ],
      },
    },
  },

  themeConfig: {
    nav: [
      { text: 'Посібник',    link: '/guide/getting-started' },
      { text: 'TypeDoc',     link: '/typedoc/', target: '_blank' },
    ],

    sidebar: [
      {
        text: 'Посібник',
        items: [
          { text: 'Початок роботи',   link: '/guide/getting-started' },
          { text: 'Архітектура',      link: '/guide/architecture' },
          { text: 'Хуки',             link: '/guide/hooks' },
          { text: 'Кешування',        link: '/guide/caching' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/VladimiKoroviakov/muzalife_frontend' },
    ],

    footer: {
      message: 'Документація MuzaLife Frontend',
      copyright: 'Copyright © 2025 Vladymir Koroviakov',
    },

    search: { provider: 'local' },
  },
});
