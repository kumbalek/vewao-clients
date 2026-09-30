// Isolated storefront contract fixture. Never forwards requests to a real backend.
// It also plays the Comgate gateway on "localhost", a different site from the
// storefront on 127.0.0.1, so returning from it is a cross-site navigation.
import { readFileSync } from "node:fs"
import { createServer } from "node:http"

const STOREFRONT = "http://127.0.0.1:8101"
const GATEWAY = "http://localhost:9101"
const region = { id: "reg_test", name: "Česko", currency_code: "czk", countries: [{ iso_2: "cz", display_name: "Česko" }] }
const address = { first_name: "Test", last_name: "Customer", address_1: "Testovací 1", city: "Praha", postal_code: "11000", country_code: "cz", phone: "777000000" }
const shippingOptions = [
  { id: "so_ppl", name: "Přepravce PPL", price_type: "flat", amount: 150, service_zone: { fulfillment_set: { type: "shipping" } }, prices: [] },
  { id: "so_pickup", name: "Pobočka Beauty Body Clinic", price_type: "flat", amount: 0, service_zone: { fulfillment_set: { type: "pickup", location: { address: { address_1: "Kosmická 19", postal_code: "149 00", city: "Praha 4 - Háje", country_code: "cz" } } } }, prices: [] },
]
const providers = [{ id: "pp_comgate_comgate" }, { id: "pp_system_default" }, { id: "pp_stripe_stripe" }]
const carts = new Map()
const orders = new Map()
const requests = []
let gatewayOutcome = "PAID"
// A product on a sale price list: Medusa's list price 1 890, sale price 1 490.
const saleProduct = {
  id: "prod_sale", handle: "akcni-produkt", title: "Akční produkt", subtitle: "Testovací akce", description: "Popis produktu",
  thumbnail: "/logo.webp", images: [], collection: null, collection_id: null, tags: [], metadata: {}, type: null,
  options: [{ id: "opt_default", title: "Default option", values: [{ id: "optval_default", value: "Default option value" }] }],
  variants: [{
    id: "variant_sale", title: "Standard", sku: "SALE-1", manage_inventory: false, allow_backorder: false, inventory_quantity: 10,
    options: [{ id: "optval_default", option_id: "opt_default", value: "Default option value" }],
    calculated_price: { calculated_amount: 1490, original_amount: 1890, currency_code: "czk", calculated_price: { price_list_type: "sale" }, original_price: { price_list_type: null } },
  }],
}
// Magazine articles as the Content plugin serves them: newest first, body_html
// only on the detail route (the plugin renders and sanitises Markdown).
const photo = { image: "http://localhost:9101/static/dn.webp", image_width: 1200, image_height: 1798, gallery: [] }
const articles = [
  {
    id: "ci_1", slug: "rozhovor-s-testovaci-klientkou", title: "Rozhovor s testovací klientkou",
    body: "**Jak jste se k nám dostala?**\\\n**A proč právě akupunktura?**\n\nDíky [doporučení](<https://example.com/>).",
    body_html: '<p><strong>Jak jste se k nám dostala?</strong><br>\n<strong>A proč právě akupunktura?</strong></p>\n<p>Díky <a href="https://example.com/" rel="nofollow noopener noreferrer" target="_blank">doporučení</a>.</p>',
    tags: [{ id: "tag_1", value: "akupunktura" }],
    metadata: { ...photo, excerpt: "Perex testovacího rozhovoru.", image_alt: "Testovací fotografie" },
  },
  {
    id: "ci_2", slug: "o-bylinach", title: "O bylinách",
    body: "Byliny **pomáhají**.", body_html: "<p>Byliny <strong>pomáhají</strong>.</p>",
    tags: [], metadata: { excerpt: null, image: null, gallery: [] },
  },
  {
    id: "ci_3", slug: "akupunktura-v-praxi", title: "Akupunktura v praxi",
    body: "Jak probíhá ošetření.", body_html: "<p>Jak probíhá ošetření.</p>",
    tags: [{ id: "tag_2", value: "akupunktura" }, { id: "tag_3", value: "fytoterapie" }],
    metadata: { ...photo, excerpt: "Jak probíhá ošetření.", image_alt: "Ošetření" },
  },
]
// Clinic collections (seed/import-clinic.ts): one category, two of its
// procedures plus one from another category, its FAQ, the team and O nás.
const clinic = {
  stranky: [
    { slug: "o-nas", title: "O nás", body: "Text o klinice.", body_html: "<p>Text o klinice.</p>", metadata: { ...photo, perex: "Perex o klinice.", image_alt: "Interiér kliniky" } },
  ],
  tym: [
    { slug: "jana-recepcni", title: "Jana Recepční", body: null, metadata: { role: "recepční", pismeno: "J", poradi: 2 } },
    { slug: "mgr-testovaci-terapeutka", title: "Mgr. Testovací Terapeutka", body: "První odstavec medailonku.\n\nDruhý odstavec medailonku.", metadata: { ...photo, role: "terapeutka", image_alt: "Testovací terapeutka", poradi: 1 } },
  ],
  "kategorie-procedur": [
    {
      slug: "akupunktura", title: "Akupunktura", body: "Úvod kategorie.",
      body_html: "<p>Úvod kategorie.</p>\n<h2>Na co se zaměřujeme?</h2>\n<h3>Dermatologie</h3>\n<p>akné, ekzém</p>",
      metadata: { ...photo, perex: null, image_alt: "Aplikace akupunktury", poradi: 1 },
    },
  ],
  procedury: [
    { slug: "druha-procedura", title: "Druhá procedura", body: "Druhý popis.", body_html: "<p>Druhý popis.</p>", metadata: { kategorie: "akupunktura", cena: null, poradi: 2 } },
    {
      slug: "testovaci-procedura", title: "Testovací procedura", body: "Popis **procedury**.", body_html: "<p>Popis <strong>procedury</strong>.</p>",
      metadata: { ...photo, kategorie: "akupunktura", cena: "od 1.000 Kč", delka: "45 min", cenik: "Jedno sezení — 1.000 Kč\nBalíček 5 sezení — 4.000 Kč", image_alt: "Procedura", poradi: 1 },
    },
    { slug: "cizi-procedura", title: "Cizí procedura", body: "Jinde.", body_html: "<p>Jinde.</p>", metadata: { kategorie: "beauty", poradi: 1 } },
  ],
  faq: [
    { slug: "faq-boli-to", title: "Bolí to?", body: "Většinou vůbec ne.", metadata: { kategorie: "akupunktura", poradi: 1 } },
    { slug: "faq-testovaci-procedura-jak-dlouho", title: "Jak dlouho to trvá?", body: "Asi hodinu.", metadata: { kategorie: "akupunktura", procedura: "testovaci-procedura", poradi: 2 } },
  ],
}
const contentCollections = { magazin: articles, ...clinic }
for (const [slug, items] of Object.entries(contentCollections)) {
  items.forEach((item, i) => Object.assign(item, {
    id: item.id ?? `ci_${slug}_${i}`, tags: item.tags ?? [], status: "published", published_at: null,
    created_at: `2026-09-2${8 - i}T10:00:00.000Z`, content_collection: { id: `cc_${slug}`, slug },
  }))
}
// What the platform's price ledger says about it; tests set it per case.
let priceHistory = { current_amount: 1490, reference_price: 1690, history_complete: true }
// Mirrors Medusa's store relation limit (platform medusa-config: 4). Deeper
// `fields` expansions get HTTP 400 from the real backend, which empties checkout.
const STORE_RELATIONS_LIMIT = 4
function relationsDepth(field) {
  const star = field.startsWith("*") || field.endsWith(".*")
  const segments = field.replace(/(^\*|\.\*$)/, "").split(".").length
  return star ? segments : segments - 1
}

// Cart id prefixes select the fixture: pickup, free PPL delivery (≥ 5 000 Kč) or paid PPL delivery.
function shippingFor(id) {
  if (id.startsWith("cart_pickup")) return { option: shippingOptions[1], amount: 0 }
  if (id.startsWith("cart_freeppl")) return { option: shippingOptions[0], amount: 0 }
  return { option: shippingOptions[0], amount: 150 }
}
function cart(id) {
  if (!carts.has(id)) {
    const { option, amount } = shippingFor(id)
    carts.set(id, {
      id, region_id: region.id, region, currency_code: "czk", email: "test@example.invalid", completed_at: null,
      shipping_address: address, billing_address: address,
      items: [{ id: "item_test", title: "Testovací produkt", product_title: "Testovací produkt", product_handle: "testovaci-produkt", quantity: 1, unit_price: 490, total: 490, original_total: 490, thumbnail: "/logo.webp", variant: { id: "variant_test", title: "Standard", options: [] }, product: { id: "prod_test", handle: "testovaci-produkt" }, metadata: {} }],
      shipping_methods: [{ id: "sm_test", shipping_option_id: option.id, name: option.name, amount, total: amount }],
      // As in Medusa 2.20: `subtotal` includes shipping; `item_subtotal` does not.
      total: 490 + amount, subtotal: 490 + amount, item_subtotal: 490, item_total: 490, shipping_subtotal: amount, shipping_total: amount,
      discount_total: 0, tax_total: 0, original_total: 490 + amount, promotions: [],
      payment_collection: { id: `paycol_${id}`, payment_sessions: [] },
    })
  }
  return carts.get(id)
}
function placeOrder(current, session) {
  const order = {
    id: `order_${current.id}`, display_id: 1001, created_at: new Date().toISOString(), email: current.email,
    currency_code: "czk", status: "pending", payment_status: session.provider_id === "pp_system_default" ? "authorized" : "captured",
    fulfillment_status: "not_fulfilled", items: current.items, shipping_address: current.shipping_address,
    shipping_methods: current.shipping_methods, subtotal: current.subtotal, item_subtotal: current.item_subtotal, item_total: current.item_total,
    total: current.total, shipping_total: current.shipping_total, shipping_subtotal: current.shipping_subtotal,
    discount_total: 0, tax_total: 0, original_total: current.total,
    payment_collections: [{ payments: [{ id: "pay_test", provider_id: session.provider_id, amount: current.total, created_at: new Date().toISOString() }] }],
  }
  current.completed_at = order.created_at
  orders.set(order.id, order)
  return order
}
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:9101")
  const send = (body, status = 200) => { res.writeHead(status, { "content-type": "application/json", "cache-control": "no-store" }); res.end(JSON.stringify(body)) }
  let body = ""
  for await (const chunk of req) body += chunk
  const data = body ? JSON.parse(body) : {}
  if (url.pathname === "/health") return send({ ok: true })
  if (url.pathname === "/__requests") return send(requests)
  if (url.pathname === "/__reset") { carts.clear(); orders.clear(); requests.length = 0; gatewayOutcome = "PAID"; priceHistory = { current_amount: 1490, reference_price: 1690, history_complete: true }; return send({ ok: true }) }
  if (url.pathname === "/__price-history") { priceHistory = { ...priceHistory, ...data }; return send({ ok: true }) }
  if (url.pathname === "/__comgate/outcome") { gatewayOutcome = data.status; return send({ ok: true }) }
  if (url.pathname === "/__comgate/pay") {
    // A gateway page the customer leaves by clicking, as on Comgate: the return
    // is then initiated by another site, which is what SameSite cookies see.
    requests.push({ method: req.method, path: url.pathname, body: {} })
    const back = `${STOREFRONT}/cz/checkout/payment-return?id=TEST-TRANS&refId=${encodeURIComponent(url.searchParams.get("refId") ?? "")}`
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" })
    return res.end(`<!doctype html><title>Test gateway</title><a href="${back}">Zpět do obchodu</a>`)
  }
  requests.push({ method: req.method, path: url.pathname, query: url.search, body: data })
  const tooDeep = (url.searchParams.get("fields") ?? "").split(",").filter((f) => f && relationsDepth(f.trim()) > STORE_RELATIONS_LIMIT)
  if (tooDeep.length) return send({ type: "invalid_data", message: `The following fields expand more than the maximum of ${STORE_RELATIONS_LIMIT} allowed relations: ${tooDeep.join(", ")}` }, 400)
  if (url.pathname === "/static/dn.webp") {
    res.writeHead(200, { "content-type": "image/webp" })
    return res.end(readFileSync(new URL("../public/dn.webp", import.meta.url)))
  }
  const listMatch = url.pathname.match(/^\/content\/([^/]+)\/items$/)
  if (listMatch) {
    const tag = url.searchParams.get("tag")
    const items = (contentCollections[listMatch[1]] ?? [])
      .filter((a) => !tag || a.tags.some((t) => t.value === tag))
      .map(({ body_html, ...a }) => a)
    return send({ content_items: items, count: items.length, limit: 200, offset: 0 })
  }
  // Like the plugin: the detail route finds an item by slug in any collection.
  const itemMatch = url.pathname.match(/^\/content\/[^/]+\/items\/([^/]+)$/)
  if (itemMatch) {
    const item = Object.values(contentCollections).flat().find((a) => a.slug === decodeURIComponent(itemMatch[1]))
    return item ? send({ content_item: item }) : send({ type: "not_found", message: `Content item "${itemMatch[1]}" not found` }, 404)
  }
  if (url.pathname === "/store/regions") return send({ regions: [region] })
  if (url.pathname === "/store/regions/reg_test") return send({ region })
  if (url.pathname === "/store/collections") return send({ collections: [], count: 0 })
  if (url.pathname === "/store/product-categories") return send({ product_categories: [], count: 0 })
  if (url.pathname === "/store/products") {
    // The SDK encodes id arrays as id[0]=…; accept any id key.
    const wanted = url.searchParams.get("handle") === saleProduct.handle || [...url.searchParams].some(([key, value]) => key.startsWith("id") && value === saleProduct.id)
    return send(wanted ? { products: [saleProduct], count: 1 } : { products: [], count: 0 })
  }
  if (url.pathname === `/store/products/${saleProduct.id}/price-history`) {
    return send({ product_id: saleProduct.id, region_id: region.id, variants: [{ variant_id: "variant_sale", currency_code: "czk", ...priceHistory }] })
  }
  if (url.pathname === "/store/customers/me") return send({ message: "Not authenticated" }, 401)
  if (url.pathname === "/store/shipping-options") return send({ shipping_options: shippingOptions })
  if (url.pathname === "/store/payment-providers") return send({ payment_providers: providers })
  const orderMatch = url.pathname.match(/^\/store\/orders\/([^/]+)$/)
  if (orderMatch) return orders.has(orderMatch[1]) ? send({ order: orders.get(orderMatch[1]) }) : send({ message: "Order not found" }, 404)
  const cartMatch = url.pathname.match(/^\/store\/carts\/([^/]+)$/)
  if (cartMatch) return send({ cart: cart(cartMatch[1]) })
  const completeMatch = url.pathname.match(/^\/store\/carts\/([^/]+)\/complete$/)
  if (completeMatch && req.method === "POST") {
    const current = cart(completeMatch[1])
    if (current.completed_at) return send({ type: "order", order: orders.get(`order_${current.id}`) })
    const session = current.payment_collection.payment_sessions[0]
    if (!session) return send({ type: "invalid_data", message: "No payment sessions" }, 400)
    if (session.provider_id === "pp_comgate_comgate" && gatewayOutcome !== "PAID") {
      // Like Medusa: authorization stores the gateway status, then rejects completion.
      if (gatewayOutcome === "CANCELLED") session.status = "canceled"
      return send({ type: "not_allowed", message: `Session: ${session.id} was not authorized with the provider.` }, 400)
    }
    return send({ type: "order", order: placeOrder(current, session) })
  }
  const sessionMatch = url.pathname.match(/^\/store\/payment-collections\/paycol_(.+)\/payment-sessions$/)
  if (sessionMatch && req.method === "POST") {
    const current = cart(sessionMatch[1])
    if (current.id.startsWith("cart_gatewaydown") && data.provider_id === "pp_comgate_comgate") {
      // What Medusa returns when Comgate rejects or cannot create the payment.
      return send({ type: "unknown_error", message: "Error setting up the request: An unknown error occurred." }, 500)
    }
    const id = `payses_${current.payment_collection.payment_sessions.length + 1}_${current.id}`
    const sessionData = data.provider_id === "pp_comgate_comgate" ? { transId: "TEST-TRANS", redirect: `${GATEWAY}/__comgate/pay?refId=${id}` } : {}
    // Medusa replaces the collection's existing session with the new one.
    current.payment_collection.payment_sessions = [{ id, provider_id: data.provider_id, status: "pending", data: sessionData }]
    return send({ payment_collection: current.payment_collection })
  }
  send({ message: `Unexpected fixture request: ${req.method} ${url.pathname}` }, 501)
})
server.listen(9101, "127.0.0.1", () => process.stdout.write("Mock Medusa ready on 127.0.0.1:9101\n"))
