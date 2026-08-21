import type { GlobalConfig } from 'payload'

import { MediaBlock } from '../blocks/news/MediaBlock'
import { SpacerBlock } from '../blocks/news/SpacerBlock'
import { TextBlock } from '../blocks/news/TextBlock'
import { TextMediaBlock } from '../blocks/news/TextMediaBlock'

export const News: GlobalConfig = {
  slug: 'news',
  label: 'News',
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'content',
      type: 'blocks',
      localized: true,
      blocks: [TextBlock, MediaBlock, TextMediaBlock, SpacerBlock],
    },
  ],
}
