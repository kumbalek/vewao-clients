/**
 * "Static variants" (owner, 2026-11-22): a product that bundles some of another
 * product's variants shows that product's option pills, the bundled ones lit
 * and the rest greyed, without being chosen. Ultherapy's Facelift covers
 * "Lower face" and "Horní část krku/podbradek" of "Aplikace na jednotlivé
 * partie". Set in admin as product metadata:
 *
 * - `static_variants_from`: the other product's handle;
 * - `static_variants`: the included option values, comma-separated.
 */

export type StaticVariantsConfig = { from: string; included: string[] }
export type StaticVariants = { title: string; values: { value: string; included: boolean }[] }

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

export function staticVariantsConfig(metadata: Record<string, unknown> | null | undefined): StaticVariantsConfig | null {
  const from = text(metadata?.static_variants_from)
  const included = text(metadata?.static_variants)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  return from && included.length ? { from, included } : null
}

type SourceProduct = {
  options?: { id: string; title?: string | null; values?: { value: string }[] | null }[] | null
  variants?: { variant_rank?: number | null; options?: { option_id?: string | null; value: string }[] | null }[] | null
}

/** The source product's first option values, in its variants' order, marked as included or not. */
export function staticVariants(source: SourceProduct | null | undefined, included: string[]): StaticVariants | null {
  const option = source?.options?.[0]
  if (!option) return null
  const byVariant = [...(source?.variants ?? [])]
    .sort((a, b) => (a.variant_rank ?? 0) - (b.variant_rank ?? 0))
    .map((variant) => variant.options?.find((o) => o.option_id === option.id)?.value)
    .filter((value): value is string => !!value)
  const values = Array.from(new Set(byVariant.length ? byVariant : (option.values ?? []).map((v) => v.value)))
  if (!values.length) return null
  const wanted = new Set(included.map((value) => value.toLocaleLowerCase("cs")))
  return {
    title: option.title ?? "",
    values: values.map((value) => ({ value, included: wanted.has(value.toLocaleLowerCase("cs")) })),
  }
}
