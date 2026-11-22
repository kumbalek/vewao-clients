import { writeFileSync } from "node:fs"

import type { ProductTextsFile } from "./dp-texts.ts"
import { htmlToLexical } from "./payload/html-lexical.ts"

/**
 * Descriptions of the clinic's service products (vewao-clients#70), from the
 * owner's texts of 2026-11-22, into service-texts.json. The storefront's
 * `import-product-texts` writes them into empty Payload descriptions:
 *
 *   pnpm payload run src/cms/scripts/import-product-texts.ts ../seed/service-texts.json
 *
 * Edits to the owner's text: the product name above it is the page title;
 * "[Jméno]" is Lucia, as the text names her; "hormonální disbalanci"; headings
 * without colons; Judita's capitalised price note in bold.
 */

const included = (items: [string, string][]) =>
  `<ul>${items.map(([lead, text]) => `<li><strong>${lead}:</strong> ${text}</li>`).join("")}</ul>`

const steps = (sendHome: string) => `<h2>Jak to funguje?</h2>
<ol>
<li>Přidejte službu do košíku a dokončete objednávku.</li>
<li>V domluvený čas se propojíme online a po důkladném rozhovoru získáte svůj osobní bylinný plán.</li>
<li>Vaši osobní bylinnou směs pro přípravu odvaru vám následně ${sendHome} až k vám domů.</li>
</ol>`

const diagnosis: [string, string] = [
  "Individuální diagnostiku",
  "Podrobný rozbor vašeho aktuálního zdravotního stavu, životního stylu a stravovacích návyků.",
]
const comfort: [string, string] = [
  "Pohodlí a flexibilitu",
  "Vše probíhá bezpečně a v klidu z vašeho domova prostřednictvím videohovoru.",
]

const html: Record<string, string> = {
  "online-konzultace-fytoterapie-s-nasi-specialistkou-lucii": `
<p>Získejte odbornou podporu na cestě k přirozenému zdraví. Během individuální online konzultace se naše certifikovaná fytoterapeutka Lucia komplexně zaměří na vaše zdravotní potíže a navrhne řešení pomocí bylinných odvarů na míru, které bude přesně odpovídat vašim potřebám.</p>
<h2>Objevte léčivou sílu bylin a odvarů na míru</h2>
<p>Fytoterapie je jednou z nejstarších a nejpřirozenějších metod péče o zdraví. Na rozdíl od syntetických přípravků působí léčivé rostliny komplexně – pomáhají tělu nenásilně navrátit ztracenou rovnováhu a probouzejí jeho přirozenou schopnost regenerace.</p>
<p>Ať už řešíte dlouhodobou únavu, oslabenou imunitu, trávicí potíže, hormonální disbalanci nebo chronický stres, správně zvolené byliny nabízejí šetrné a účinné řešení. Lucia ve své praxi vychází z hlubokých principů tradiční čínské medicíny (TCM) a úzce navazuje na celostní filozofii naší kliniky. Neřeší pouze povrchové symptomy, ale empaticky a pečlivě hledá skutečnou příčinu problému uvnitř těla.</p>
<p>Vrcholem této individuální péče jsou bylinné odvary sestavené přesně na míru. Neexistuje univerzální recept pro všechny – po detailní diagnostice pro vás Lucia navrhne unikátní kombinaci bylin. Tradiční forma odvarů zajišťuje maximální možnou koncentraci a vstřebatelnost účinných látek, což tělu dodává přesně ten impuls, který k uzdravení v danou chvíli potřebuje.</p>
<h2>Co konzultace zahrnuje</h2>
${included([
  diagnosis,
  [
    "Odvary a bylinný protokol na míru",
    "Odborné sestavení unikátní směsi bylin pro přípravu léčivých odvarů, doplněné případně o další bylinné čaje či doplňky stravy.",
  ],
  [
    "Empatický a holistický přístup",
    "Dostatek času a prostoru pro vás. Vnímáme vaše tělo jako jeden propojený celek a nasloucháme vašim potřebám.",
  ],
  comfort,
])}
${steps("můžeme zaslat")}
<p>Dopřejte svému tělu šetrnou péči z přírody pod vedením naší zkušené terapeutky.</p>`,

  "online-konzultace-fytoterapie-s-juditou-halvovou": `
<p>Získejte odbornou podporu na cestě k přirozenému zdraví. Během individuální online konzultace se Judita Halvová komplexně zaměří na vaše zdravotní potíže a navrhne řešení pomocí fytoterapeutických odvarů na míru, které bude odpovídat vašim konkrétním potřebám.</p>
<h2>Objevte léčivou sílu bylin a odvarů na míru</h2>
<p>Fytoterapie je jednou z nejstarších a nejpřirozenějších metod péče o zdraví. Na rozdíl od syntetických přípravků působí léčivé rostliny komplexně – obsahují stovky účinných látek, které pracují v dokonalé synergii. Tělu tak nenásilně pomáhají navrátit ztracenou rovnováhu a probouzejí jeho přirozenou schopnost regenerace a samoléčby.</p>
<p>Ať už řešíte dlouhodobou únavu, oslabenou imunitu, trávicí potíže, hormonální disbalanci nebo chronický stres, správně zvolené byliny nabízejí šetrné a účinné řešení. Judita ve své praxi propojuje znalosti západního bylinkářství s hlubokými principy tradiční čínské medicíny (TCM). Díky tomu neřeší pouze povrchové symptomy, ale zaměřuje se na skutečnou příčinu problému uvnitř těla.</p>
<p>Vrcholem této individuální péče jsou bylinné odvary sestavené přesně na míru. Neexistuje univerzální recept pro všechny – na základě detailní diagnostiky pro vás Judita navrhne unikátní kombinaci bylin. Tradiční forma odvarů zajišťuje maximální možnou koncentraci a vstřebatelnost účinných látek, což tělu dodává přesně ten impuls, který v danou chvíli potřebuje.</p>
<h2>Co konzultace zahrnuje</h2>
${included([
  diagnosis,
  [
    "Bylinný protokol na míru",
    "Odborné sestavení unikátní směsi bylin pro přípravu léčivých odvarů, doplněné případně o další čajové směsi (např. z řady Herbs by JuditH), tinktury či doplňky stravy.",
  ],
  ["Holistický přístup", "Hledání skutečných příčin potíží a vnímání těla jako jednoho celku."],
  comfort,
])}
${steps("zašleme")}
<p><strong>Cena konzultace nezahrnuje cenu odvaru.</strong> Ta je individuální dle gramáže bylin atd.</p>
<p>Dopřejte svému tělu péči, která respektuje jeho přirozený rytmus.</p>`,
}

const products: ProductTextsFile["products"] = {}
for (const [handle, text] of Object.entries(html)) {
  products[handle] = { subtitle: null, description: htmlToLexical(text) }
}
const file: ProductTextsFile = { source: "Owner's texts, 2026-11-22", products }
writeFileSync(new URL("./service-texts.json", import.meta.url), `${JSON.stringify(file, null, 2)}\n`)
console.log(`service-texts.json: ${Object.keys(products).length} products`)
