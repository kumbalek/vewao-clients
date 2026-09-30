import { clx } from "@medusajs/ui"
import React from "react"

// Styles for rendered Markdown. Editorial <strong> (interview questions) uses
// quiche-sans 700; everything else keeps the regular weight.
const prose = [
  "text-lg leading-8 text-ink",
  "[&_p]:mt-6 [&>*:first-child]:mt-0",
  "[&_strong]:font-bold [&_em]:italic",
  "[&_a]:text-sage-strong [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-ink",
  "[&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:small:text-3xl [&_h3]:mt-8 [&_h3]:text-xl",
  "[&_h3+p]:mt-2",
  "[&_ul]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-6 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_blockquote]:mt-6 [&_blockquote]:border-l [&_blockquote]:border-line [&_blockquote]:pl-6",
  "[&_img]:mt-6 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-card",
].join(" ")

/**
 * HTML rendered by the Content plugin: remark-rehype drops raw HTML, then
 * rehype-sanitize (GitHub schema) runs before links are hardened. Only pass
 * the plugin's `body_html` here.
 */
export function RichText({
  html,
  className,
  ...props
}: { html: string; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clx(prose, className)} dangerouslySetInnerHTML={{ __html: html }} {...props} />
  )
}

/** A text-format body: blank lines separate paragraphs. */
export function PlainText({
  text,
  className,
  ...props
}: { text: string; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clx(prose, className)} {...props}>
      {text
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </div>
  )
}
