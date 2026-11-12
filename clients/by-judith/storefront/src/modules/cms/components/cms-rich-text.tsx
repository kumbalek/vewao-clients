import Image from "next/image"

import { renderLexical, type LexicalMedia, type LexicalState } from "@lib/cms/lexical"
import { sameOriginPath } from "@lib/cms/media-url"

/** An image in CMS rich text, resized by next/image. Without known dimensions the renderer's plain <img> applies. */
function cmsImage(media: LexicalMedia, key: number) {
  if (!media.width || !media.height) return undefined
  return (
    <Image
      key={key}
      src={sameOriginPath(media.url)}
      alt={media.alt}
      width={media.width}
      height={media.height}
      sizes="(min-width: 1024px) 800px, 100vw"
      className="h-auto w-full"
    />
  )
}

/** CMS rich text (Payload Lexical), images included. Works in server and client components. */
export default function CmsRichText({ state }: { state: LexicalState }) {
  return <>{renderLexical(state, { image: cmsImage })}</>
}
