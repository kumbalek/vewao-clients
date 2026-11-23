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
 * without colons; the capitalised price note in bold, for both (owner). The
 * other vouchers' texts are short; their edits are noted beside them.
 */

const included = (items: [string, string][]) =>
  `<ul>${items.map(([lead, text]) => `<li><strong>${lead}:</strong> ${text}</li>`).join("")}</ul>`

const steps = (sendHome: string) => `<h2>Jak to funguje?</h2>
<ol>
<li>Přidejte službu do košíku a dokončete objednávku.</li>
<li>V domluvený čas se propojíme online a po důkladném rozhovoru získáte svůj osobní bylinný plán.</li>
<li>Vaši osobní bylinnou směs pro přípravu odvaru vám následně ${sendHome} až k vám domů.</li>
</ol>`

// Owner, 2026-11-22: for both consultations.
const priceNote =
  "<p><strong>Cena konzultace nezahrnuje cenu odvaru.</strong> Ta je individuální dle gramáže bylin atd.</p>"

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
${priceNote}
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
${priceNote}
<p>Dopřejte svému tělu péči, která respektuje jeho přirozený rytmus.</p>`,
}

// Short voucher descriptions, owner's texts of 2026-11-22. One Ultherapy text
// for all three Ultherapy products.
const ultherapy =
  "<p>Neinvazivní lifting Ultherapy® Prime cílí přesně do hlubokých vrstev pokožky (SMAS), kde probouzí tvorbu vlastního kolagenu. Žádná rekonvalescence, žádné jizvy – pouze postupné, přirozené zpevnění kontur s efektem přetrvávajícím 1 až 2 roky.</p>"
Object.assign(html, {
  "ultherapy-aplikace-na-jednotlive-partie": ultherapy,
  "ultherapy-facelift": ultherapy,
  "ultherapy-full-facelift": ultherapy,
  "modelace-a-hydratace-rtu-lips-by-boris-jegorov":
    "<p>Přirozená plnost, dokonalé kontury a hloubková hydratace. To jsou oblíbené Jegorovky, neboli rty od MUDr. Borise Jegorova. Letos je můžete darovat za cenu, která potěší každého Ježíška.</p>",
  "vyhlazeni-mimickych-vrasek-baby-botox":
    "<p>Prémiový botulotoxin pro uvolnění vrásek na čele, mezi obočím (glabela) a v okolí očí. Výsledkem je odpočatý, mladistvý výraz při zachování přirozené mimiky, který potěší nejen pod stromečkem.</p>",
  blefaroplastika:
    "<p>Plastická operace horních očních víček. Precizní chirurgický zákrok pod vedením zkušeného plastického chirurga, který odstraní nadbytečnou kůži víček, otevře pohled a zbaví obličej unaveného výrazu na mnoho let, nejen na Vánoce.</p>",
  // The owner's longer text added 2026-11-22: the quote as an italic paragraph
  // (no quote block in the converter), double spaces removed.
  "vstupni-osobni-diagnostika-judity-halvove": `<p>Komplexní 45minutové vyšetření podle principů tradiční čínské medicíny (diagnostika z jazyka, pulzu a celkové konstituce), na jehož základě stanovíme přesný plán terapie a úpravy životosprávy na míru.</p>
<h2>Osobní diagnostika tradiční čínské medicíny s Juditou Halvovou v Praze</h2>
<p>Trápí vás atopický ekzém, padání vlasů (alopecie), bolesti zad a kloubů, migrény, ženské potíže nebo vleklá onemocnění, se kterými si váš lékař už neví rady?</p>
<p>Máme řešení, které neléčí pouze symptomy, ale odstraňuje skutečnou příčinu.</p>
<p>Vstupní diagnostika v konceptu by JuditH představuje klíč k pochopení toho, proč vaše tělo vysílá varovné signály. Propojujeme autentické diagnostické postupy ověřené tisíciletími s bylinnou léčbou na míru a cílenou akupunkturou.</p>
<h2>Proč právě diagnostika u Judity Halvové?</h2>
<p><em>„Během své dlouhodobé stáže v nemocnici čisté tradiční čínské medicíny v Číně u MUDr. Penga jsem si uvědomila zásadní věc: základem úspěchu vyléčení jakéhokoliv zdravotního problému je detailní vstupní diagnostika. Teprve když přesně určíme kořen nerovnováhy, můžeme sestavit cílenou recepturu bylinných odvarů na míru a zvolit správné akupunkturní body. Díky této přesnosti vidíme u klientů výrazné zlepšení stavu již po několika málo aplikacích.“</em></p>
<p>— Judita Halvová, zakladatelka konceptu by JuditH</p>
<h2>S jakými problémy vám dokážeme pomoci?</h2>
<p>Naše specializace se zaměřuje na stavy, kde běžná medicína často naráží na limity a opakovaně nasazuje kortikoidy či analgetika:</p>
${included([
  ["Kožní onemocnění", "Atopický ekzém, akné v dospělosti, lupénka, periorální dermatitida."],
  ["Péče o vlasy", "Difúzní padání vlasů, ložisková i androgenní alopecie."],
  ["Bolesti těla a hlavy", "Chronické bolesti zad a šíje, migrény, záněty šlach a kloubů."],
  ["Ženské a hormonální potíže", "Bolestivá a nepravidelná menstruace, projevy PMS, příprava na početí, klimakterium."],
  ["Psychosomatika a imunita", "Chronická únava, nespavost, oslabená imunita, trávicí disbalance."],
])}
<h2>Co přesně osobní diagnostika TČM obsahuje?</h2>
<p>Během konzultace získáte komplexní obraz o fungování svého organismu:</p>
${included([
  ["Diagnostika z pulzu", "Čtení stavu vnitřních orgánových okruhů, hladiny životní energie Qi a kvality krve."],
  ["Diagnostika z jazyka", "Vyhodnocení barvy, tvaru, rýh a povlaku, které odhalují přítomnost toxinů, vnitřní horkosti či vlhkosti v těle."],
  ["Podrobný rozbor životního stylu a symptomů", "Prověření stravovacích návyků, spánku, termoregulace těla a emoční zátěže."],
  ["Individuální léčebný plán", "Návrh přesné receptury bylinných odvarů Herbs by JuditH a doporučení frekvence tradiční či permanentní akupunktury Acupuncture by JuditH."],
])}`,
  "balicek-5x-akupunktura-u-senior-terapeuta":
    "<p>Ucelená terapeutická kúra zaměřená na odstranění chronických bolestí, harmonizaci nervového systému, podporu spánku a hlubokou regeneraci organismu pod vedením našich senior terapeutů.</p>",
  // "Zvažujete", "k MUDr. Jegorovovi" (dative), a closing full stop.
  "osobni-konzultace-s-mudr-jegorovem": `<p>Zvažujete estetický zákrok a nejste si jistí, co je pro vás to pravé?</p>
<p>Objednejte se na konzultaci k MUDr. Jegorovovi, atestovanému plastickému chirurgovi, který s vámi vše detailně probere a vysvětlí. V případě, že se rozhodnete pro zákrok u nás na klinice, bude vám cena konzultace od zákroku odečtena. Konzultace trvá 30 minut.</p>`,
  // "vám" in lower case, as in the other texts.
  "osobni-konzultace-s-pletovou-terapeutkou": `<p>Nevíte, která procedura je pro vás ta pravá? Expertka na léčbu pleti, včetně injekčních aplikací, vám doporučí nejvhodnější ošetření pro řešení těžkých forem akné, pigmentací, vrásek, ale i kruhů pod očima či rozšířených žilek nebo znamének.</p>
<p>Délka konzultace je 30 minut. V případě, že absolvujete ošetření u nás, vám bude částka za konzultaci odečtena z výsledné ceny.</p>`,
})

const products: ProductTextsFile["products"] = {}
for (const [handle, text] of Object.entries(html)) {
  products[handle] = { subtitle: null, description: htmlToLexical(text) }
}
const file: ProductTextsFile = { source: "Owner's texts, 2026-11-22", products }
writeFileSync(new URL("./service-texts.json", import.meta.url), `${JSON.stringify(file, null, 2)}\n`)
console.log(`service-texts.json: ${Object.keys(products).length} products`)
