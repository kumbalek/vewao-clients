import assert from "node:assert/strict"
import test from "node:test"
import { withdrawalPrefill } from "../src/lib/util/withdrawal.ts"

test("withdrawalPrefill fills the order number, name, e-mail and one line per item", () => {
  const order = {
    display_id: 1002,
    items: [
      { quantity: 2, title: "Default", product_title: "Antistress" },
      { quantity: 1, title: "Dárkové balení", product_title: null },
    ],
  }
  assert.deepEqual(withdrawalPrefill(order, { first_name: "Jana", last_name: "Nováková", email: "jana@example.cz" }), {
    order_reference: "1002",
    customer_name: "Jana Nováková",
    email: "jana@example.cz",
    items: "2× Antistress\n1× Dárkové balení",
  })
})

test("withdrawalPrefill tolerates a missing name and items", () => {
  assert.deepEqual(withdrawalPrefill({ display_id: 7 }, { first_name: null, last_name: "", email: "a@b.cz" }), {
    order_reference: "7",
    customer_name: "",
    email: "a@b.cz",
    items: "",
  })
})
