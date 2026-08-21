import type { Block } from 'payload'

export const TextMediaBlock: Block = {
  slug: 'textMediaBlock',
  interfaceName: 'TextMediaBlock',
  labels: {
    singular: 'Text + Media',
    plural: 'Text + Media Blocks',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'content',
      type: 'richText',
    },
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'mediaPosition',
      type: 'select',
      required: true,
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    {
      name: 'mediaMobilePosition',
      type: 'select',
      required: true,
      defaultValue: 'top',
      options: [
        { label: 'Top', value: 'top' },
        { label: 'Bottom', value: 'bottom' },
      ],
    },
  ],
}
