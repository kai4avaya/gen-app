/* Central functions registry and execution wiring */

export type ToolDef = {
  name: string
  description?: string
  parameters?: Record<string, any> // JSON schema-like
  handler: (args: any) => Promise<any> | any
}

export type ToolRegistry = {
  specs: Array<{ type: 'function'; function: { name: string; description?: string; parameters?: Record<string, any> } }>
  mapping: Record<string, (args: any) => Promise<any> | any>
}

// Build registry from a list of ToolDef (single endpoint to expose all tools)
export function makeRegistry(tools: ToolDef[]): ToolRegistry {
  return {
    specs: tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.parameters } })),
    mapping: Object.fromEntries(tools.map((t) => [t.name, t.handler])),
  }
}

// Example: add more tools by pushing into the list below

// Wikipedia image search tool
const wikipediaImagesTool: ToolDef = {
  name: 'wikipedia_images',
  description: 'Search Wikipedia for an article and return image URLs (thumbnails) from the top result.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search term for the Wikipedia article' },
      limit: { type: 'integer', description: 'Maximum number of images to return', default: 3 },
    },
    required: ['query']
  },
  handler: async ({ query, limit = 3 }: { query: string; limit?: number }) => {
    // Step 1: Search for the article
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
    const searchResp = await fetch(searchUrl)
    const searchData = await searchResp.json()
    const page = searchData?.query?.search?.[0]
    if (!page) return { images: [], note: 'No article found' }
    const pageId = page.pageid
    // Step 2: Get images for the page
    const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageId}&prop=images&format=json&origin=*`;
    const imagesResp = await fetch(imagesUrl)
    const imagesData = await imagesResp.json()
  const pageObj = Object.values(imagesData?.query?.pages ?? {})[0] as any
  const imageTitles = Array.isArray(pageObj?.images) ? pageObj.images.map((img: any) => img.title) : []
    // Step 3: For each image, get the thumbnail URL
    const thumbPromises = imageTitles.slice(0, limit).map(async (title: string) => {
      const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url&iiurlwidth=300&format=json&origin=*`;
      const infoResp = await fetch(infoUrl)
      const infoData = await infoResp.json()
      const pageObj = Object.values(infoData.query.pages ?? {})[0] as any
      let thumb: string | undefined
      if (Array.isArray(pageObj?.imageinfo)) {
        thumb = pageObj.imageinfo[0]?.thumburl || pageObj.imageinfo[0]?.url
      }
      return thumb
    })
    const thumbs = (await Promise.all(thumbPromises)).filter(Boolean)
    return { images: thumbs, article: `https://en.wikipedia.org/?curid=${pageId}` }
  }
}

export const defaultTools: ToolDef[] = [
  // placeholder example tool
  {
    name: 'echo',
    description: 'Echo back the provided payload',
    parameters: { type: 'object', properties: { payload: { type: 'string' } }, required: ['payload'] },
    handler: async ({ payload }: { payload: string }) => ({ payload })
  },
  wikipediaImagesTool,
]

export const defaultRegistry = makeRegistry(defaultTools)
