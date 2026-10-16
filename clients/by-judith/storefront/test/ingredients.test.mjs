import assert from "node:assert/strict"
import test from "node:test"
import { parseIngredients } from "../src/lib/util/ingredients.ts"

test("legacy JSON arrays keep one entry per ingredient", () => {
  const raw = '[     "Meruňka obecná (extrakt ze semene) 960 mg",     "protispékavé látky: oxid křemičitý" ]'
  assert.deepEqual(parseIngredients(raw), [
    [{ text: "Meruňka obecná (extrakt ze semene) 960 mg", allergen: false }],
    [{ text: "protispékavé látky: oxid křemičitý", allergen: false }],
  ])
})

test("marked allergens become emphasised segments", () => {
  assert.deepEqual(parseIngredients('["**Hořčice** setá (extrakt ze semene) 640 mg", "sója a **mléko**, **celer**"]'), [
    [{ text: "Hořčice", allergen: true }, { text: " setá (extrakt ze semene) 640 mg", allergen: false }],
    [{ text: "sója a ", allergen: false }, { text: "mléko", allergen: true }, { text: ", ", allergen: false }, { text: "celer", allergen: true }],
  ])
})

test("plain text and broken JSON fall back to lines; empty values give nothing", () => {
  assert.deepEqual(parseIngredients("Šalvěj 10 mg\n\n**Sezam**"), [
    [{ text: "Šalvěj 10 mg", allergen: false }],
    [{ text: "Sezam", allergen: true }],
  ])
  assert.deepEqual(parseIngredients('["neuzavřený'), [[{ text: '["neuzavřený', allergen: false }]])
  assert.deepEqual(parseIngredients(undefined), [])
  assert.deepEqual(parseIngredients("  "), [])
})
