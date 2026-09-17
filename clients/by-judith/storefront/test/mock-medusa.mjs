// Isolated storefront contract fixture. Never forwards requests to a real backend.
import { createServer } from "node:http"

const region = { id: "reg_test", name: "Česko", currency_code: "czk", countries: [{ iso_2: "cz", display_name: "Česko" }] }
const address = { first_name: "Test", last_name: "Customer", address_1: "Testovací 1", city: "Praha", postal_code: "11000", country_code: "cz", phone: "777000000" }
const carts = new Map()
const requests = []
const shipping = { id: "so_test", name: "Doručení", price_type: "flat", amount: 89, service_zone: { fulfillment_set: { type: "shipping" } }, prices: [] }
const providers = [{ id: "pp_comgate_comgate" }, { id: "pp_system_default" }, { id: "pp_stripe_stripe" }]
function cart(id) {
  if (!carts.has(id)) carts.set(id, {
    id, region_id: region.id, region, currency_code: "czk", email: "test@example.invalid",
    shipping_address: address, billing_address: address,
    items: [{ id: "item_test", title: "Testovací produkt", product_title: "Testovací produkt", product_handle: "testovaci-produkt", quantity: 1, unit_price: 490, total: 490, original_total: 490, thumbnail: "/logo.webp", variant: { id: "variant_test", title: "Standard", options: [] }, product: { id: "prod_test", handle: "testovaci-produkt" }, metadata: {} }],
    shipping_methods: [{ id: "sm_test", shipping_option_id: shipping.id, name: id.startsWith("cart_pickup") ? "Osobní odběr" : "Doručení", amount: id.startsWith("cart_pickup") ? 0 : 89 }],
    total: id.startsWith("cart_pickup") ? 490 : 579, subtotal: 490, shipping_subtotal: id.startsWith("cart_pickup") ? 0 : 89,
    discount_total: 0, tax_total: 0, promotions: [],
    payment_collection: { id: `paycol_${id}`, payment_sessions: [] },
  })
  return carts.get(id)
}
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:9101")
  const send = (body, status = 200) => { res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)) }
  let body = ""
  for await (const chunk of req) body += chunk
  const data = body ? JSON.parse(body) : {}
  if (url.pathname === "/health") return send({ ok: true })
  if (url.pathname === "/__requests") return send(requests)
  if (url.pathname === "/__reset") { carts.clear(); requests.length = 0; return send({ ok: true }) }
  requests.push({ method: req.method, path: url.pathname, body: data })
  if (url.pathname === "/store/regions") return send({ regions: [region] })
  if (url.pathname === "/store/regions/reg_test") return send({ region })
  if (url.pathname === "/store/collections") return send({ collections: [], count: 0 })
  if (url.pathname === "/store/product-categories") return send({ product_categories: [], count: 0 })
  if (url.pathname === "/store/products") return send({ products: [], count: 0 })
  if (url.pathname === "/store/customers/me") return send({ message: "Not authenticated" }, 401)
  if (url.pathname === "/store/shipping-options") return send({ shipping_options: [shipping] })
  if (url.pathname === "/store/payment-providers") return send({ payment_providers: providers })
  const cartMatch = url.pathname.match(/^\/store\/carts\/([^/]+)$/)
  if (cartMatch) return send({ cart: cart(cartMatch[1]) })
  const sessionMatch = url.pathname.match(/^\/store\/payment-collections\/paycol_(.+)\/payment-sessions$/)
  if (sessionMatch && req.method === "POST") {
    const current = cart(sessionMatch[1])
    current.payment_collection.payment_sessions = [{ id: "payses_test", provider_id: data.provider_id, status: "pending", data: { comgate_redirect_url: "https://payments.example.invalid/test" } }]
    return send({ payment_collection: current.payment_collection })
  }
  // Completing an order is deliberately unsupported: these tests cannot charge or place orders.
  send({ message: `Unexpected fixture request: ${req.method} ${url.pathname}` }, 501)
})
server.listen(9101, "127.0.0.1", () => process.stdout.write("Mock Medusa ready on 127.0.0.1:9101\n"))
