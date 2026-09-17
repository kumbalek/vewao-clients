import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type BreadcrumbsProps = {
  path: {
    name: string
    href: string
  }[]
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path }) => {
  return (
    <div className="flex gap-1 small:gap-2 text-[#85977b] text-xs small:text-sm">
      {path.map(({ name, href }, index) => (
        <span key={href}>
          <LocalizedClientLink href={href}>{name}</LocalizedClientLink>
          {index !== path.length - 1 && (
            <span className="ml-1 small:ml-2">{"|"}</span>
          )}
        </span>
      ))}
    </div>
  )
}

export default Breadcrumbs
