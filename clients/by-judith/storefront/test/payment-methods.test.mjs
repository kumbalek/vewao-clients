import assert from "node:assert/strict"
import test from "node:test"
import {
  availablePaymentMethods,
  isManual,
  isPickupOption,
  paymentReturnStatus,
} from "../src/lib/util/payment-methods.ts"

const methods = [
  { id: "pp_comgate_comgate" },
  { id: "pp_system_default" },
  { id: "pp_stripe_stripe" },
  { id: "pp_stripe-ideal_stripe" },
  { id: "pp_unknown" },
]

const options = [
  { id: "so_pickup", service_zone: { fulfillment_set: { type: "pickup" } } },
  { id: "so_ppl", service_zone: { fulfillment_set: { type: "shipping" } } },
  { id: "so_bare" },
]

test("obsolete and unknown providers are excluded even when the backend returns them", () => {
  assert.deepEqual(availablePaymentMethods(methods, true).map(({ id }) => id), [
    "pp_comgate_comgate", "pp_system_default",
  ])
})
test("delivery retains Comgate without offering pay-on-site", () => {
  assert.deepEqual(availablePaymentMethods(methods, false), [methods[0]])
})
test("an unavailable supported provider is not invented", () => {
  assert.deepEqual(availablePaymentMethods([{ id: "pp_stripe_stripe" }], true), [])
})
test("manual provider IDs require an exact match", () => {
  assert.equal(isManual("pp_system_default_obsolete"), false)
})
test("pickup comes from the fulfillment set, not a zero price", () => {
  assert.equal(isPickupOption("so_pickup", options), true)
  assert.equal(isPickupOption("so_ppl", options), false)
})
test("a missing, unknown or incomplete shipping option is not pickup", () => {
  assert.equal(isPickupOption(undefined, options), false)
  assert.equal(isPickupOption("so_gone", options), false)
  assert.equal(isPickupOption("so_bare", options), false)
  assert.equal(isPickupOption("so_pickup", null), false)
})
test("a cancelled or failed gateway session sends the customer back to payment", () => {
  assert.equal(paymentReturnStatus("canceled"), "failed")
  assert.equal(paymentReturnStatus("error"), "failed")
})
test("any other unfinished session is shown as pending, never as paid", () => {
  for (const status of ["pending", "requires_more", "authorized", undefined]) {
    assert.equal(paymentReturnStatus(status), "pending")
  }
})
