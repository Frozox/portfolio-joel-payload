import DOMPurify from 'isomorphic-dompurify'
import type { Thing, WithContext } from 'schema-dts'

interface JsonLdLoaderProps {
  jsonLd: WithContext<Thing>
}

const JsonLdLoader = ({ jsonLd }: JsonLdLoaderProps) => {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line @eslint-react/dom/no-dangerously-set-innerhtml
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(JSON.stringify(jsonLd).replace(/</g, '\\u003c')),
      }}
    />
  )
}

export default JsonLdLoader
