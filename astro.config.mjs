import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import site from './data/site.json' with { type: 'json' };

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isProjectPage = repository && !repository.endsWith('.github.io');

export default defineConfig({
  publicDir: './data/static',
  site: process.env.SITE_URL || site.url,
  base: process.env.BASE_PATH || (isProjectPage ? `/${repository}` : '/'),
  integrations: [mdx(), sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false
    }
  }
});
