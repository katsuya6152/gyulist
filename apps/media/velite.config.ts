import { defineConfig, defineCollection, s } from 'velite'
import readingTime from 'reading-time'

const computedFields = <T extends Record<string, unknown>>(data: T) => {
  const title = (data.title as string) || '';
  const generatedSlug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // スラッグを常に生成されたスラッグで上書き（確実性を重視）
  const validSlug = generatedSlug;
  
  return {
    ...data,
    slug: validSlug,
    slugAsParams: validSlug,
    url: `/posts/${validSlug}`,
    readingTime: readingTime(data.content as string),
  };
}

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(99),
      description: s.string().max(999),
      publishedAt: s.isodate(),
      updatedAt: s.isodate().optional(),
      category: s.string(),
      tags: s.array(s.string()).optional(),
      image: s.string().optional(),
      author: s.string().default('Gyulist編集部'),
      featured: s.boolean().default(false),
      draft: s.boolean().default(false),
      content: s.markdown(),
    })
    .transform(computedFields),
})

const pages = defineCollection({
  name: 'Page',
  pattern: 'pages/**/*.mdx',
  schema: s
    .object({
      title: s.string().max(99),
      description: s.string().max(999),
      slug: s.string().optional(),
      updatedAt: s.isodate().optional(),
      content: s.markdown(),
    })
    .transform((data) => ({
      ...data,
      slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      url: `/${data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
    })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts, pages },
  mdx: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})
