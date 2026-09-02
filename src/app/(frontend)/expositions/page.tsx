import { NewsBlockRenderer } from '@/components/news/newsBlockRenderer'
import { getNews } from '@/lib/payload-data'

const NewsPage = async () => {
  const news = await getNews()

  return (
    <div className="size-full animate-content-load">
      <div className="container">
        {(news.content ?? []).map((block, idx) => (
          <NewsBlockRenderer key={block.id ?? idx} block={block} />
        ))}
      </div>
    </div>
  )
}

export default NewsPage
