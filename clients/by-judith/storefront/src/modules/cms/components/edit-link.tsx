import { cmsPublicUrl } from "@lib/cms/client"

/** Opens the document in the CMS admin. Rendered only in edit-mode previews. */
export default function EditLink({ collection, id, label }: { collection: string; id: number; label: string }) {
  return (
    <a
      href={`${cmsPublicUrl()}/admin/collections/${collection}/${id}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="self-start rounded-full border border-gold bg-white px-3 py-1 text-xs text-ink hover:bg-surface-hover"
      data-testid="cms-edit-link"
    >
      Upravit
    </a>
  )
}
