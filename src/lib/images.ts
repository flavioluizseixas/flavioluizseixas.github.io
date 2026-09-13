import type { ImageMetadata } from 'astro';

const images = import.meta.glob<ImageMetadata>(
  '/data/images/**/*.{png,jpg,jpeg,webp,avif,gif}',
  { eager: true, import: 'default' }
);
const urls = import.meta.glob<string>(
  '/data/images/**/*.{png,jpg,jpeg,webp,avif,gif,svg}',
  { eager: true, query: '?url&no-inline', import: 'default' }
);

export function contentImage(name: string): ImageMetadata {
  const image = images[`/data/images/${name}`];
  if (!image) throw new Error(`Imagem não encontrada em data/images: ${name}`);
  return image;
}

export function contentImageUrl(name: string): string {
  const url = urls[`/data/images/${name}`];
  if (!url) throw new Error(`Imagem não encontrada em data/images: ${name}`);
  return url;
}
