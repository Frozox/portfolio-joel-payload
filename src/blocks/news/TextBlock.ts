import type { Block } from 'payload'

export const TextBlock: Block = {
  slug: 'textBlock',
  interfaceName: 'TextBlock',
  labels: {
    singular: 'Text',
    plural: 'Text Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
  ],
}
