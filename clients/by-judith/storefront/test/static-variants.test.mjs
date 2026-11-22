import assert from "node:assert/strict"
import test from "node:test"

import { staticVariants, staticVariantsConfig } from "../src/lib/util/static-variants.ts"

test("static variants come from two metadata keys", () => {
  assert.deepEqual(
    staticVariantsConfig({ static_variants_from: " ultherapy-aplikace ", static_variants: "Lower face,  Horní část krku/podbradek ," }),
    { from: "ultherapy-aplikace", included: ["Lower face", "Horní část krku/podbradek"] }
  )
  assert.equal(staticVariantsConfig({ static_variants_from: "x" }), null)
  assert.equal(staticVariantsConfig({ static_variants: "Krk" }), null)
  assert.equal(staticVariantsConfig({ static_variants_from: "x", static_variants: " , " }), null)
  assert.equal(staticVariantsConfig(null), null)
})

test("the source's values in its variant order, the included ones marked", () => {
  const source = {
    options: [{ id: "opt", title: "Partie", values: [{ value: "Krk" }, { value: "Brow lift" }, { value: "Lower face" }] }],
    variants: [
      { variant_rank: 2, options: [{ option_id: "opt", value: "Krk" }] },
      { variant_rank: 0, options: [{ option_id: "opt", value: "Brow lift" }] },
      { variant_rank: 1, options: [{ option_id: "opt", value: "Lower face" }] },
    ],
  }
  assert.deepEqual(staticVariants(source, ["lower face", "Krk"]), {
    title: "Partie",
    values: [
      { value: "Brow lift", included: false },
      { value: "Lower face", included: true },
      { value: "Krk", included: true },
    ],
  })
  assert.equal(staticVariants({ options: [] }, ["Krk"]), null)
  assert.equal(staticVariants(null, ["Krk"]), null)
})
