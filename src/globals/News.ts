import type { GlobalConfig } from 'payload'

import { globalPermission } from '../access/globalPermission'
import { MediaBlock } from '../blocks/news/MediaBlock'
import { SpacerBlock } from '../blocks/news/SpacerBlock'
import { TextBlock } from '../blocks/news/TextBlock'
import { TextMediaBlock } from '../blocks/news/TextMediaBlock'
import { generatePreviewPath } from '../lib/generatePreviewPath'

export const News: GlobalConfig = {
  slug: 'news',
  label: 'Expositions',
  access: {
    read: () => true,
    update: globalPermission('news', 'update'),
  },
  admin: {
    preview: () => generatePreviewPath({ path: '/expositions' }),
    livePreview: {
      url: () => generatePreviewPath({ path: '/expositions' }),
    },
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
