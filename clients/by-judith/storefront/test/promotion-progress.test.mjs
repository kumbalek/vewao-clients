import assert from "node:assert/strict"
import test from "node:test"
import {
  discountableItemCount,
  formatTierValue,
  promotionProgress,
} from "../src/lib/util/promotion-progress.ts"

// Legacy tiers from GET /store/promotion-tiers.
const TIER_10 = {
  code: "TIER_10",
  min_count: 1,
  type: "percentage",
  value: 10,
  currency_code: null,
  message: "🎉 Získáváte slevu 10 %!",
  teaser: "Kupte 1 balení a získáte 10 % slevu, 2 balení 20 %, 3+ balení 30 %!",
}
const TIER_20 = {
  code: "TIER_20",
  min_count: 2,
  type: "percentage",
  value: 20,
  currency_code: null,
  message: "🔥 Získáváte slevu 20 %!",
  teaser: "Kupte jakýkoliv další produkt a získáte 20 %.",
}
const TIER_30 = {
  code: "TIER_30",
  min_count: 3,
  type: "percentage",
  value: 30,
  currency_code: null,
  message: "🏆 Získáváte maximální slevu 30 %!",
  teaser: "Kupte jakýkoliv další produkt a získáte 30 %.",
}
const legacy = [TIER_10, TIER_20, TIER_30]

test("no tiers gives no progress", () => {
  assert.equal(promotionProgress(null, [{ quantity: 1 }]), null)
  assert.equal(promotionProgress(undefined, [{ quantity: 1 }]), null)
  assert.equal(promotionProgress([], [{ quantity: 1 }]), null)
})

test("empty cart looks at the first tier", () => {
  const p = promotionProgress(legacy, [])
  assert.equal(p.count, 0)
  assert.equal(p.current, null)
  assert.equal(p.next.code, "TIER_10")
  assert.equal(p.remaining, 1)
  assert.equal(p.percent, 0)
  assert.equal(p.text, "Kupte 1 balení a získáte 10 % slevu, 2 balení 20 %, 3+ balení 30 %!")
})

test("gift packaging does not count towards a tier", () => {
  const p = promotionProgress(legacy, [
    { quantity: 1 },
    { quantity: 1, is_discountable: false },
  ])
  assert.equal(p.count, 1)
  assert.equal(p.current.code, "TIER_10")
  assert.equal(p.next.code, "TIER_20")
  assert.equal(p.percent, 33.33)
  assert.equal(p.text, "🎉 Získáváte slevu 10 %! Kupte jakýkoliv další produkt a získáte 20 %.")
})

test("three items reach the last tier", () => {
  const p = promotionProgress(legacy, [{ quantity: 1 }, { quantity: 2 }])
  assert.equal(p.count, 3)
  assert.equal(p.current.code, "TIER_30")
  assert.equal(p.next, null)
  assert.equal(p.remaining, 0)
  assert.equal(p.percent, 100)
  assert.equal(p.text, "🏆 Získáváte maximální slevu 30 %!")
})

test("a count above the last tier stays at 100 percent", () => {
  const p = promotionProgress(legacy, [{ quantity: 5 }])
  assert.equal(p.percent, 100)
  assert.equal(p.current.code, "TIER_30")
})

test("steps mark positions and reached tiers for count 2", () => {
  const p = promotionProgress(legacy, [{ quantity: 2 }])
  assert.deepEqual(
    p.steps.map((s) => s.position),
    [33.33, 66.67, 100]
  )
  assert.deepEqual(
    p.steps.map((s) => s.reached),
    [true, true, false]
  )
  assert.deepEqual(
    p.steps.map((s) => s.label),
    ["10 %", "20 %", "30 %"]
  )
})

test("Czech defaults apply when message and teaser are null", () => {
  const tiers = [
    {
      code: "TIER_2",
      min_count: 2,
      type: "percentage",
      value: 15,
      currency_code: null,
      message: null,
      teaser: null,
    },
  ]
  assert.equal(
    promotionProgress(tiers, [{ quantity: 0 }]).text,
    "Přidejte ještě 2 ks a získáte slevu 15 %."
  )
  assert.equal(promotionProgress(tiers, [{ quantity: 2 }]).text, "Získáváte slevu 15 %!")
})

test("teaser placeholders are filled with the remaining count and value", () => {
  const tiers = [
    {
      code: "TIER_3",
      min_count: 3,
      type: "percentage",
      value: 10,
      currency_code: null,
      message: null,
      teaser: "Ještě {remaining} ks do slevy {value}",
    },
  ]
  assert.equal(
    promotionProgress(tiers, [{ quantity: 1 }]).text,
    "Ještě 2 ks do slevy 10 %"
  )
})

test("formatTierValue uses a comma for percentages and the Czech currency format for fixed", () => {
  assert.equal(formatTierValue({ ...TIER_10, value: 10 }), "10 %")
  assert.equal(formatTierValue({ ...TIER_10, value: 12.5 }), "12,5 %")
  const fixed = {
    ...TIER_10,
    type: "fixed",
    value: 100,
    currency_code: "czk",
  }
  assert.equal(
    formatTierValue(fixed),
    new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(100)
  )
})

test("unsorted tiers still pick current/next by min_count and order steps", () => {
  const p = promotionProgress([TIER_30, TIER_10, TIER_20], [{ quantity: 2 }])
  assert.equal(p.current.code, "TIER_20")
  assert.equal(p.next.code, "TIER_30")
  assert.deepEqual(
    p.steps.map((s) => s.code),
    ["TIER_10", "TIER_20", "TIER_30"]
  )
})

test("discountableItemCount ignores null lines and non-positive quantities", () => {
  assert.equal(discountableItemCount(null), 0)
  assert.equal(discountableItemCount([null, undefined, { quantity: 0 }, { quantity: -1 }]), 0)
  assert.equal(discountableItemCount([{ quantity: 2 }, { quantity: 1.5 }]), 3.5)
  assert.equal(discountableItemCount([{ is_discountable: false, quantity: 9 }]), 0)
})