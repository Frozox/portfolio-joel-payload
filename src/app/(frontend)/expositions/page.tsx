import { draftMode } from 'next/headers'

import { NewsBlockRenderer } from '@/components/news/newsBlockRenderer'
import LivePreviewListener from '@/components/preview/livePreviewListener'
import { isAdminPreviewRequest } from '@/lib/isAdminPreviewRequest'
import { getNews } from '@/lib/payload-data'

const NewsPage = async () => {
  const { isEnabled } = await draftMode()
  const draft = isEnabled && (await isAdminPreviewRequest())
  const news = await getNews(draft)

  return (
    <div className="size-full animate-content-load">
      {draft && <LivePreviewListener />}
      <div className="container">
        {(news.content ?? []).map((block, idx) => (
          <NewsBlockRenderer key={block.id ?? idx} block={block} />
        ))}
      </div>
    </div>
  )
}

export default NewsPage
