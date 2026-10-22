import RefreshOnSave from "./refresh-on-save"

/** Shown only in a CMS preview: what the visitor is looking at, and the way out. */
export default function PreviewBar({ path, pageId, edit }: { path: string; pageId: number; edit: boolean }) {
  return (
    <div role="region" aria-label="Náhled konceptu" className="sticky bottom-0 z-[60] flex flex-wrap items-center justify-center gap-3 border-t border-line bg-cream px-4 py-3 text-sm text-ink" data-testid="cms-preview-bar">
      <span>{edit ? "Režim úprav: zobrazujete rozpracovaný koncept." : "Náhled konceptu – stránka ještě není zveřejněná v této podobě."}</span>
      {edit && (
        <a href={`/admin/collections/pages/${pageId}`} target="_blank" rel="noopener noreferrer" className="underline">
          Upravit stránku v CMS
        </a>
      )}
      <a href={`/api/cms/exit?path=${encodeURIComponent(path)}`} className="underline">
        Ukončit náhled
      </a>
      {edit && <RefreshOnSave />}
    </div>
  )
}
