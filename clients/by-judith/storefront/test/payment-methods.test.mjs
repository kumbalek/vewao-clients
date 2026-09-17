import assert from "node:assert/strict"
import test from "node:test"
import { availablePaymentMethods, isManual } from "../src/lib/util/payment-methods.ts"

const methods = [
  { id: "pp_comgate_comgate" },
  { id: "pp_system_default" },
  { id: "pp_stripe_stripe" },
  { id: "pp_stripe-ideal_stripe" },
  { id: "pp_unknown" },
]

test("obsolete and unknown providers are excluded even when the backend returns them", () => {
  assert.deepEqual(availablePaymentMethods(methods, 0).map(({ id }) => id), [
    "pp_comgate_comgate", "pp_system_default",
  ])
})
test("paid delivery retains Comgate without offering in-store payment", () => {
  assert.deepEqual(availablePaymentMethods(methods, 89), [methods[0]])
})
test("a missing shipping amount is not treated as free pickup", () => {
  assert.deepEqual(availablePaymentMethods(methods, undefined), [methods[0]])
})
test("an unavailable supported provider is not invented", () => {
  assert.deepEqual(availablePaymentMethods([{ id: "pp_stripe_stripe" }], 0), [])
})
test("manual provider IDs require an exact match", () => {
  assert.equal(isManual("pp_system_default_obsolete"), false)
})
