import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isProjectPage = repository && !repository.endsWith('.github.io');

export default defineConfig({
  site: process.env.SITE_URL || 'https://flavioluizseixas.github.io',
  base: process.env.BASE_PATH || (isProjectPage ? `/${repository}` : '/'),
  integrations: [mdx(), sitemap()],
  markdown: { shikiConfig: { theme: 'github-dark' } }
});
