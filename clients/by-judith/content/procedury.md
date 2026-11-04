# Procedury: texty od copywritera, strukturované

Zdroj: `texty.md` od copywritera (2026-11-04). Tento soubor obsahuje jen texty
k procedurám. Obecné texty o značce, týmu a ostatních položkách menu (ceník,
galerie, magazín, akce, obchodní podmínky) jsou vynechané.

Obsah textů je převzatý beze změny. Úpravy jsou jen formální: odstraněné tučné
písmo a kódové formátování, sjednocené mezery a nadpisy. Opravené překlepy
a otevřené otázky jsou na konci souboru.

Struktura: **kategorie → procedura → podprocedura**. Procedury východní
medicíny podprocedury nemají. Nadpisy tohoto souboru odpovídají této
hierarchii; nadpisy textů (H1, H2, H3) jsou u každé položky uvedené jako pole.

## Datový model v CMS

Kolekce **Kategorie procedur** (Východní a Západní medicína) a **Procedury**.
Podprocedura je procedura s vyplněnou nadřazenou procedurou a kategorii
přebírá od ní (vewao-clients#43).

| V tomto souboru | Pole v CMS |
| --- | --- |
| Název v menu | Název v menu (`name`) |
| URL | Adresa (`slug`) |
| Meta title, Meta description, Klíčová slova | SEO (`seo.title`, `seo.description`, `seo.keywords`) |
| Anotace na rozcestníku, Odkaz | Rozcestník: Anotace, Text odkazu (`annotation`, `annotationLink`) |
| H1 | Nadpis stránky (`title`) |
| Perex, Úvod | Perex (`perex`) |
| H2 s textem | Obsah stránky → blok **Text** |
| H2 s body (H3 a text, tučné odrážky, číslované kroky) | Obsah stránky → blok **Seznam bodů** (vzhled: nadpisy / odrážky / kroky) |
| Preparát nebo přístroj (H3, Princip, Účinek, …) | Obsah stránky → blok **Preparát nebo přístroj** |
| CTA | Text tlačítka rezervace (`ctaLabel`) |
| (z webu) cena, délka, řádky ceníku | Cena: Cena krátce, Délka, Ceník (`priceSummary`, `duration`, `priceRows`) |

Kategorie mají Název v menu, Krátký popis v menu, H1, Perex, Obrázek, Obsah
stránky a SEO; procedury kategorie se pod obsahem vypíší s anotacemi.

## Přehled menu

| Úroveň | Název v menu | URL od copywritera | Text v podkladech |
| --- | --- | --- | --- |
| Kategorie | Východní medicína | `/vychodni-medicina/` | rozcestník |
| Procedura | Diagnostika TČM (Základ každé úspěšné léčby) | – | anotace, stránka |
| Procedura | Tradiční akupunktura | `/akupunktura-praha/` | anotace, stránka |
| Procedura | Permanentní akupunktura | `/permanentni-akupunktura-praha/` | anotace, stránka |
| Procedura | Bylinná fytoterapie na míru | – (pole je prázdné) | anotace, stránka |
| Kategorie | Západní medicína | `/zapadni-medicina/` | rozcestník |
| Procedura | Injekční aplikace | – | anotace, stránka |
| Podprocedura | Mezoterapie, biorevitalizace, biostimulace pleti | – | 4 preparáty* |
| Podprocedura | Péče o vlasovou pokožku | – | 1 preparát* |
| Podprocedura | Modelace rtů | – | 1 preparát* |
| Podprocedura | Aplikace botulotoxinu | – | 1 preparát* |
| Procedura | Přístrojové ošetření | `/pristrojova-osetreni-praha/` | anotace, stránka |
| Podprocedura | Ultherapy® Prime | – | text |
| Podprocedura | Dermapen World – mikrojehličkování | – | text |
| Podprocedura | Plexr® | – | text |
| Podprocedura | Frakční laser (?) | – | **chybí** |
| Procedura | Plastická chirurgie | – | jen anotace |
| Podprocedura | Blefaroplastika (i spodní?) | – | jen zmínka v anotaci |
| Podprocedura | Chirurgická excize | – | **chybí** |
| Podprocedura | Přímý brow lift | – | **chybí** |

\* V podkladech jsou všechny preparáty na jedné stránce „Injekční aplikace“.
Přiřazení k podprocedurám je odvozené z jejich obsahu a je potřeba ho ověřit.

---

## Východní medicína

- **URL:** `/vychodni-medicina/` (kategorie, rozcestník)
- **Role stránky:** Představení konceptu TČM na klinice, odkud vedou odkazy do podsekcí.
- **Meta title:** Tradiční čínská medicína Praha | By JuditH
- **Meta description:** Celostní východní medicína na klinice v Praze. Odhalte a vyřešte vnitřní příčiny nemocí, ekzémů a únavy díky diagnostice TČM, akupunktuře a fytoterapii.
- **H1:** Tradiční čínská medicína: Obnova vnitřní rovnováhy a zdraví organismu

**Perex:**
Tradiční čínská medicína (TČM) nahlíží na lidské tělo jako na dokonale propojený systém. Pokud se objeví nemoc, bolest, chronický zánět nebo kožní reakce, jde o volání těla o pomoc kvůli narušené rovnováze. U nás v Acupuncture by JuditH nevnímáme symptomy jako nepřítele, kterého je nutné pouze potlačit. Hledáme skutečný pramen potíží a pomáháme organismu nastartovat jeho vlastní samoozdravné procesy.

**H2: Jak východní medicína pomáhá?**
TČM dosahuje mimořádných výsledků u chronických stavů, kde běžná medicína často nabízí pouze dočasná řešení v podobě kortikoidů či analgetik. Naší doménou je léčba atopických ekzémů, akné, alopecie, gynekologických potíží, nespavosti, trávicích obtíží i chronické únavy. Stejně tak poskytujeme empatickou doprovodnou péči pro posílení vitality pacientů procházejících náročnou konvenční léčbou.

### Diagnostika TČM

- **Název v menu:** Diagnostika TČM (Základ každé úspěšné léčby)
- **URL:** – (chybí)
- **Meta title:** Diagnostika TČM Praha | Acupuncture by JuditH
- **Meta description:** Vstupní diagnostika tradiční čínské medicíny u Judity Halvové v Praze. Odhalte skutečnou příčinu zdravotních potíží pomocí pulzu, jazyka a celostního rozboru.
- **CTA:** – (chybí)

**Anotace na rozcestníku:**
Než začneme léčit, musíme vaše tělo do hloubky poznat. Komplexní diagnostika zahrnuje podrobný rozbor životního stylu, detailní pulzovou diagnostiku a diagnostiku dle obrazu jazyka. Díky tomu přesně lokalizujeme energetické blokády, patogenní horkost, vlhkost či oslabení klíčových orgánových okruhů.
Odkaz: „Více o vstupní diagnostice TČM →“

**H1:** Diagnostika TČM v Praze: Poznejte skutečnou příčinu svých obtíží

**Perex:**
Západní medicína často rozděluje tělo na jednotlivé orgány a zaměřuje se na potlačení konkrétního příznaku. V Acupuncture by JuditH se na vaše zdraví díváme jako na ucelený příběh. Než navrhneme jakýkoliv terapeutický krok, musíme vaše tělo do hloubky pochopit. Vstupní diagnostika tradiční čínské medicíny (TČM) přímo u Judity Halvové představuje první a nejdůležitější krok na cestě k nalezení vnitřní rovnováhy a trvalého zdraví.

**H2: Jak diagnostika TČM funguje? Čtyři pilíře poznání těla**
V tradiční čínské medicíně nevyužíváme mechanické přístroje, ale léty vytříbené diagnostické metody, které čtou jemné signály lidského těla dříve, než se nerovnováha promění v chronické onemocnění:

- **H3: 1. Diagnostika z pulzu (Čtení vnitřního stavu orgánů)**
  Pulzová diagnostika na radiálních tepnách obou zápěstí je vrcholnou disciplínou TČM. Judita Halvová, která tuto dovednost prohlubovala během svých stáží přímo v Číně. Pulz odhaluje aktuální stav energie Qi, kvalitu krve, přítomnost patogenní horkosti, chladu, vlhkosti či skrytých zánětů v jednotlivých orgánových okruzích.
- **H3: 2. Diagnostika z jazyka (Zrcadlo vnitřního prostředí)**
  Jazyk je mapou našeho těla. Hodnotíme nejen jeho barvu a tvar, ale také přítomnost rýh, otisků zubů a charakter povlaku. Jazyk poskytuje okamžitý a objektivní důkaz o stavu hydratace, přetížení jater, oslabení sleziny či hromadění toxinů.
- **H3: 3. Podrobný anamnestický rozhovor (Dotazování)**
  Zajímá nás vše, co moderní diagnostika často přehlíží: kvalita vašeho spánku, termoregulace (zda trpíte na studené končetiny nebo vnitřní horkost), úroveň energie během dne, trávení, chuťové preference i emoční zátěž.
- **H3: 4. Pozorování a poslech**
  Tón hlasu, jas očí, barva a pružnost pleti či struktura vlasů – to vše jsou střípky skládačky, které dotvářejí celkový energetický obraz vašeho organismu.

### Tradiční akupunktura

- **Název v menu:** Tradiční akupunktura
- **URL:** `/akupunktura-praha/`
- **Klíčová slova:** akupunktura Praha, tradiční akupunktura, léčba akupunkturou Praha, uvolnění bolesti akupunktura, akupunktura pro ženy, Acupuncture by JuditH
- **Meta title:** Tradiční akupunktura Praha | Acupuncture by JuditH
- **Meta description:** Špičková tradiční akupunktura v Praze pod vedením Judity Halvové. Cílené uvolnění bolesti, regulace hormonů, zmírnění stresu a podpora regenerace těla.
- **CTA:** Objednat se na tradiční akupunkturu

**Anotace na rozcestníku:**
Akupunktura patří k nejstarším, nejprověřenějším a nejhlubším léčebným systémům světa. V sekci Acupuncture by JuditH k ní přistupujeme s absolutním respektem k její autentické tradici, kterou Judita Halvová prohlubovala přímo u mistrů v Číně. Pomocí aplikace sterilních mikrojehliček do přesně definovaných akupunkturních bodů obnovujeme plynulý tok energie Qi, odstraňujeme vnitřní blokády meridiánů a probouzíme v organismu jeho přirozené samoozdravné procesy.
Odkaz: „Více o akupunktuře a tradiční akupunktuře →“

**H1:** Tradiční akupunktura v Praze: Obnova toku životní energie a úleva od bolesti

**Perex:**
Akupunktura je jedním z nejstarších a nejprověřenějších léčebných systémů světa. V by JuditH ji vnímáme jako jemné, avšak mimořádně přesné umění komunikace s lidským tělem. Pomocí aplikace sterilních mikrojehliček do specifických akupunkturních bodů obnovujeme plynulý tok energie Qi v meridiánech, uvolňujeme hluboké blokády a navracíme tělu schopnost samoléčby.

**H2: Jak akupunktura působí na lidský organismus?**
Podle tradiční čínské medicíny vzniká každá bolest či nemoc tam, kde došlo k zástavě nebo oslabení toku energie a krve. Z pohledu moderní neurofyziologie stimulace akupunkturních bodů prokazatelně ovlivňuje centrální nervový systém:

- Vyplavuje endorfiny
- Zlepšuje lokální mikrocirkulaci a prokrvení tkání
- Reguluje autonomní nervový systém (přepíná tělo ze stresového režimu do stavu regenerace a klidu),
- Moduluje imunitní odpověď a tlumí zánětlivé procesy.

**H2: Hlavní oblasti, kde akupunktura přináší zásadní úlevu:**

- **H3: Bolesti pohybového aparátu a migrény**
  Chronické i akutní bolesti zad, krční páteře, syndrom karpálního tunelu, bolesti velkých kloubů a tenzní bolesti hlavy.
- **H3: Dermatologie (atopický ekzém, alopecie, akné)**
  Odvedení horkosti a tonizace organismu za účelem zklidnění kůže, odstranění zánětlivých projevů na kůži.
- **H3: Ženské zdraví a hormonální rovnováha**
  Harmonizace menstruačního cyklu, odstranění bolestivé menstruace, podpora při endometrióze, příprava těla na početí a zmírnění menopauzálních projevů.
- **H3: Psychosomatika, stres a nespavost**
  Zklidnění mysli (Shen), zmírnění úzkostí, odstranění vnitřního neklidu a obnova hlubokého, regeneračního spánku.
- **H3: Podpora trávení a metabolismu**
  Léčba refluxu, žaludečních neuróz, syndromu dráždivého tračníku a funkčních trávicích potíží.

**H2: Průběh ošetření**

- **Jemnost a bezpečí:** Používáme výhradně jednorázové, ultra tenké sterilní jehličky z prvotřídní chirurgické oceli. Vpich je díky speciální technice téměř nepostřehnutelný.
- **Čas pro hlubokou regeneraci:** Po zavedení jehliček odpočíváte v klidném prostředí naší kliniky po dobu 20 až 40 minut. Většina klientů během ošetření zažívá stav hluboké relaxace či usíná.
- **Individuální přístup:** Body volíme vždy na základě aktuálního stavu a vstupního pulzového vyšetření.

### Permanentní akupunktura

- **Název v menu:** Permanentní akupunktura
- **Podtitul ve zdroji:** Permanent Acupuncture by JuditH
- **URL:** `/permanentni-akupunktura-praha/`
- **Klíčová slova:** permanentní akupunktura Praha, TČM, permanentní akupunktura na hubnutí, léčba alopecie, Judita Halvová
- **Meta title:** Permanentní akupunktura Praha | Acupuncture by JuditH
- **Meta description:** Inovativní permanentní akupunktura v Praze. Nepřetržitá stimulace bodů po 60 dní. Aplikace pouze 1× za 1–2 měsíce. Objednejte se.
- **CTA:** Rezervovat termín diagnostiky

**Anotace na rozcestníku:**
Vedle klasické akupunktury nabízíme naši specializaci – permanentní akupunkturu. Žijeme v dynamické době, kdy je čas často tou nejvzácnější hodnotou. Běžná akupunktura vyžaduje pravidelné a časté návštěvy. Judita Halvová proto v rámci konceptu Acupuncture by JuditH přináší inovativní řešení pro 21. století: permanentní akupunkturu. Tato metoda kombinuje hloubku tradičního učení s maximálním komfortem pro klienta – poskytuje tělu trvalý léčebný impuls 24 hodin denně po dobu několika týdnů, aniž byste museli trávit hodiny na opakovaných terapiích. Ta působí v těle nepřetržitě až po dobu 60 dní a vyžaduje návštěvu pouze jednou za 1–2 měsíce, což představuje maximálně efektivní péči pro časově vytížené klienty.
Odkaz: „Více o akupunktuře a permanentní akupunktuře →“

**H1:** Permanentní akupunktura v Praze: Revoluční metoda v TCM

**Perex:**
Žijeme v dynamické době a pro moderního člověka je čas tím nejcennějším. Klasická akupunktura vyžaduje pravidelné a časté návštěvy kliniky. Judita Halvová proto přináší metodu, která spojuje hloubku tradičního učení s maximální efektivitou 21. století: permanentní akupunkturu. Tato metoda poskytuje tělu nepřetržitou terapeutickou péči 24 hodin denně po dobu několika týdnů.

**H2: Jak metoda permanentní akupunktury funguje?**
Během krátkého ambulantního ošetření zavádíme pomocí jemné duté mikrojehličky do vybraných akupunkturních bodů miniaturní sterilní vlákno z biokompatibilního medicínského materiálu.
Zatímco klasická jehlička stimuluje bod pouze po dobu aplikace, biovlákno zůstává v podkoží a stimuluje daný bod nepřetržitě až po dobu 60 dnů, dokud se přirozeně a beze zbytku nevstřebá. Tím je zajištěn permanentní tok energie a dlouhodobý léčebný impuls.

**H2: Klíčové výhody pro váš život a zdraví:**

- **Návštěva pouze 1× za 1 až 2 měsíce:** Ideální řešení pro vytížené a mimopražské či zahraniční klienty.
- **Nepřetržitý léčebný účinek:** Tělo dostává stálý impuls k samoozdravným procesům bez výkyvů a přerušení kontinuity péče.
- **Maximální bezpečnost:** Používáme certifikovaný materiál, který tělo bezpečně metabolizuje bez alergických reakcí či jizev.
- **Rychlá a šetrná aplikace:** Zákrok trvá pouze několik minut a nevyžaduje žádnou rekonvalescenci – ihned se můžete vrátit ke svým povinnostem.

**H2: Hlavní terapeutické indikace:**

- **H3: Zastavení padání vlasů a léčba alopecie**
  Trvalá mikrostimulace reflexních bodů podporuje prokrvení pokožky hlavy, vyživuje vlasové folikuly a stimuluje růst nových, silnějších vlasů.
- **H3: Léčba atopického ekzému, lupénky a akné**
  Dlouhodobě odvádí vnitřní zánětlivou horkost z krve, harmonizuje imunitní reakci pokožky a předchází návratu akutních projevů.
- **H3: Efektivní a zdravé hubnutí**
  Nepřetržitá stimulace bodů na uchu a těle reguluje centrum sytosti, tlumí chuť na sladké, eliminuje emoční přejídání a zrychluje metabolismus tekutin a tuků.
- **H3: Doprovodná onkologická péče a vyčerpání**
  Pomáhá udržet vitalitu a stabilitu organismu v obdobích vysokého tělesného a psychického vypětí.

### Bylinná fytoterapie na míru

- **Název v menu:** Bylinná fytoterapie na míru
- **URL:** – (ve zdroji prázdné)
- **Klíčová slova:** čínská fytoterapie Praha, Chinese Herbs Formula by JuditH, bylinné odvary TČM, byliny na míru Praha, Judita Halvová byliny, léčivé houby TČM
- **Meta title:** Bylinná fytoterapie | Herbs by JuditH Praha
- **Meta description:** Autentická bylinná fytoterapie a směsi na míru Chinese Herbs Formula by JuditH v Praze. Čisté certifikované byliny TČM pro hloubkovou léčbu a regeneraci.
- **CTA:** Objednat diagnostiku

**Anotace na rozcestníku:**
Byliny jsou pilířem vnitřní očisty a regenerace. Judita Halvová staví na originálních recepturách získaných během dlouhodobé praxe u MUDr. Penga přímo v Číně. Pro každého klienta předepisujeme individuální bylinné odvary a směsi z přísně testovaných, certifikovaných surovin, které vyživují krev, čistí tkáně a doplňují životní energii.
Odkaz: „Více o fytoterapii na míru →“

**H1:** Fytoterapie by JuditH: Autentická síla bylinných receptur na míru

**Perex:**
V tradiční čínské medicíně je bylinná fytoterapie považována za nejhlubší pilíř vnitřní přeměny. Zatímco akupunktura energii v těle směruje a uvolňuje její blokády, byliny mají moc dodat tělu to, co mu chybí – vyživit krev, doplnit esenci a očistit tkáně. Bylinné odvary na míru staví Judita Halvová na původních formulích, které studovala během dlouhodobých odborných stáží přímo u MUDr. Penga v Číně. Jsou individuálně předepisovány každému klientovi na míru, na základě Diagnostiky dle TČM (odkaz na Diagnostiku TČM).

**H2: V čem je fytoterapie by JuditH výjimečná?**

- **Receptury připravené výhradně pro vás:** Každá bylinná směs je namíchána na základě vaší individuální pulzové a jazykové diagnostiky.
- **Přísná certifikace a čistota surovin:** Používáme byliny nejvyšší terapeutické jakosti, které procházejí přísnými laboratorními testy v akreditovaných laboratořích v EU. Jsou garantovaně bez těžkých kovů, pesticidů, mikrobiální kontaminace a plísní.
- **Synergie tradice a vědy:** Tradiční čínské postupy zpracování kombinujeme s moderními standardy bezpečnosti a čistoty.
- **Dynamická úprava receptur:** Jak se vaše tělo pod vlivem léčby uzdravuje a proměňuje, složení směsí na pravidelných kontrolách upravujeme tak, aby odpovídalo vašim aktuálním potřebám.

**H2: S čím individuální bylinné směsi pomáhají nejvíce?**

- **H3: Chronické dermatologické potíže**
  Odstraňují vnitřní toxiny a „patogenní horkost“, čistí zažívací trakt a přinášejí dlouhodobou úlevu od těžkých ekzémů, akné v dospělosti, periorální dermatitidy i lupénky.
- **H3: Vnitřní výživa pro růst vlasů**
  Dle TČM jsou vlasy odrazem vitality ledvin a dostatku krve. Bylinné směsi vyživují vlasové kořínky zevnitř tam, kde klasické doplňky stravy a produkty na péči o vlasy nestačí.
- **H3: Hormonální a gynekologická rovnováha**
  Podpora pravidelného cyklu, tlumení projevů PMS, posílení endometria a podpora vitality pro přirozené početí.
- **H3: Podpůrná péče pro onkologické pacienty a rekonvalescence**
  Pomáháme mírnit vyčerpání organismu způsobené náročnou konvenční léčbou, harmonizujeme žaludek a posilujeme imunitní systém.

**H2: Naše formy bylinných přípravků**

- **Tradiční odvary na míru:** Koncentrované výluhy z celých bylin a kořenů s nejrychlejším nástupem účinku.
- **Chinese Herbs Formula by JuditH:** Naše prémiová řada cílených bylinných receptur a vyvíjených doplňků stravy (včetně nově vyvinutého speciálního bylinného proteinu pro regeneraci a posílení imunity).

**H2: Jak probíhá sestavení vaší bylinné směsi?**

1. **Osobní konzultace s Juditou Halvovou:** Vyšetření pulzu, jazyka
2. **Návrh receptury:** Sestavení přesného poměru bylin pro vyrovnání vaší specifické disbalance.
3. **Příprava směsi:** Certifikované namíchání z prověřených surovin a doručení přímo k vám nebo k vyzvednutí na klinice.
4. **Kontrola:** Po dobrání předepsané kombinace bylin (obvykle 3 až 4 týdny) vyhodnotíme posun a směs přizpůsobíme další fázi léčby.

---

## Západní medicína

- **URL:** `/zapadni-medicina/` (kategorie, rozcestník)
- **Role stránky:** Představení lékařské dermatologie, přístrojů a plastické chirurgie s důrazem na bezpečnost a přirozený výsledek.
- **Meta title:** Estetická dermatologie a plastická chirurgie Praha | (ve zdroji neúplné)
- **Meta description:** Špičková západní medicína v Praze. Plastická chirurgie MUDr. Jegorov, prémiové injekční biostimulátory a přístroje Plexr, Dermapen 4 či Ultherapy Prime.
- **H1:** Západní medicína a estetická péče: Špičkové technologie a lékařská preciznost

**Perex:**
Západní estetická medicína v pojetí Clinic by JuditH představuje spojení nejmodernějších vědeckých poznatků, inovativních medicínských přístrojů a chirurgie s absolutním citem pro detail. Odmítáme umělé trendy, nepřirozený objem a ztrátu mimiky. Naším cílem je zachovat vaši jedinečnou tvář, navrátit pleti ztracený tonus, odstranit únavu a podtrhnout vaši přirozenou krásu s maximálním důrazem na bezpečnost a dlouhodobý efekt.

**H2: Moderní postupy pod dohledem zkušených lékařů**
Veškeré invazivní a přístrojové procedury u nás provádějí certifikovaní lékaři či zdravotnický personál s rozsáhlou praxí a certifikací. Používáme výhradně originální zdravotnické prostředky nejvyšší třídy. Západní postupy u nás navíc nepůsobí v izolaci – díky zázemí kliniky umíme podpořit pooperační hojení i regeneraci tkání celostními postupy, což minimalizuje otoky a výrazně zkracuje rekonvalescenci.

### Injekční aplikace

- **Název v menu:** Injekční aplikace
- **URL, meta title, meta description:** – (chybí)
- **CTA:** Rezervovat termín lékařské konzultace

**Anotace na rozcestníku:**
Zaměřujeme se na bioremodelaci a obnovu kolagenu bez chirurgického zásahu. Využíváme prémiové kolagenové stimulátory Radiesse® či RRS® Long Lasting, hloubkový skinbooster s glycerolem Belotero® Revive i cílenou mezoterapii pro oční okolí (RRS® HA Eyes) a zastavení padání vlasů (XL Hair®).
Odkaz: „Prohlédnout injekční ošetření →“

**H1:** Injekční aplikace a bioremodelace pleti v Praze: Přirozené omlazení bez ztráty mimiky

**Úvod:**
Moderní estetická dermatologie v pojetí Clinic by JuditH nestojí na umělém vyplňování obličeje ani na maskovitém znehybnění rysů. Věříme v buněčnou biostimulaci, hloubkovou hydrataci a respekt k přirozené anatomii tváře.

Veškeré injekční zákroky u nás provádějí zkušení lékaři. Používáme výhradně originální, biokompatibilní preparáty nejvyšší švýcarské, německé a evropské kvality, které tělo stimulují k vlastní tvorbě kolagenu a elastinu.

**H2: Naše prémiové procedury a přípravky** (preparáty jsou rozdělené do podprocedur níže)

**H2: Proč podstoupit injekční ošetření v Clinic by JuditH?**

- **Lékařský dohled a bezpečnost:** Zákroky provádějí výhradně certifikovaní lékaři s dokonalou znalostí anatomie a citem pro detail.
- **Přirozený výsledek bez nadsázky:** Naším cílem je, abyste vypadali odpočatě, svěže a mladistvě – nikoliv „upraveně“.
- **Synergie se zdravím:** Injekční procedury můžeme v rámci celostního konceptu by JuditH doplnit o vnitřní bylinnou fytoterapii Herbs by JuditH, která podpoří hojení a tvorbu kolagenu zevnitř.

**H2: Objednejte se na konzultaci**
Nevíte, který preparát je pro vaši pleť nejvhodnější? Při osobní konzultaci lékař zhodnotí stav vaší pokožky a sestaví individuální plán na míru.

#### Mezoterapie, biorevitalizace, biostimulace pleti

- **Název v menu:** Mezoterapie, biorevitalizace, biostimulace pleti
- **Preparáty:** Radiesse®, RRS® HA Long Lasting, Belotero® Revive, RRS® HA Eyes (přiřazení k ověření)

**H3: Radiesse® – Kolagenový stimulátor a tekutý lifting kontur**

- **Princip:** Inovativní dermální stimulátor na bázi mikrosfér hydroxyapatitu vápenatého (CaHA).
- **Účinek:** Nejde o pouhou výplň. Radiesse funguje jako kolagenové lešení, které v hlubokých vrstvách podkoží spouští tvorbu nového kolagenu typu I a elastinu.
- **Ideální pro:** Zpevnění povadlé linie spodní čelisti (jawline), obnovu kontur lícních kostí, vyhlazení hlubokých nosoretních vrásek, zpevnění ochablého krku a omlazení hřbetů rukou.
- **Výsledek:** Přirozený zpevňující efekt přetrvává 12 až 18 měsíců.

**H3: RRS® HA Long Lasting – 7bodový hybridní biostimulační lifting**

- **Princip:** Synergické spojení vysokomolekulární zesíťované kyseliny hyaluronové s komplexem 15 aminokyselin a biomimetických peptidů.
- **Účinek:** Aplikuje se speciální 7bodovou technikou do přesně daných zón na každé straně obličeje. Poskytuje okamžitý jemný lifting, zpevňuje ochablou tkáň a dodává pleti okamžitou pružnost.
- **Ideální pro:** Unavenou, povadlou pleť se ztrátou elasticity, která potřebuje okamžitý restart a remodelaci bez dlouhé rekonvalescence.

**H3: Belotero® Revive („Summer Glow“) – Hloubkový skinbooster s glycerolem**

- **Princip:** Špičkový švýcarský skinbooster propojující zesíťovanou kyselinu hyaluronovou patentované technologie CPM® s čistým glycerolem.
- **Účinek:** Glycerol působí jako mimořádně silný magnet na vláhu. Pleť získává neuvěřitelnou šťavnatost, sjednocenou texturu a ikonický „glow“ efekt (přirozený zářivý jas) bez přidání nežádoucího objemu.
- **Ideální pro:** Dehydrovanou pleť, pokožku namáhanou sluncem, sjednocení jemných linek a redukci začervenání na obličeji, krku a dekoltu. Efekt přetrvává až 9 měsíců.

**H3: RRS® HA Eyes – Rozjasnění očního okolí a redukce únavy**

- **Princip:** Speciální mezoterapeutický koktejl navržený exkluzivně pro tenkou, jemnou a citlivou kůži v oblasti očí. Obsahuje nezesíťovanou kyselinu hyaluronovou, flavonoidy, vitamíny a peptidy podporující mikrocirkulaci.
- **Účinek:** Zlepšuje lymfatický odtok, zpevňuje pergamenovou kůži víček a prosvětluje oční zónu.
- **Ideální pro:** Tmavé kruhy pod očima, ranní otoky očních víček a jemné mimické vrásky kolem očí.

#### Péče o vlasovou pokožku

- **Název v menu:** Péče o vlasovou pokožku
- **Preparáty:** XL Hair® (přiřazení k ověření)

**H3: XL Hair® – Intenzivní vlasová mezoterapie proti padání vlasů**

- **Princip:** Medicinální biorevitalizační roztok (CE Class III) kombinující kyselinu hyaluronovou s 28 aktivními složkami (růstové faktory, aminokyseliny, antioxidanty a vitamíny skupiny B).
- **Účinek:** Vpravuje se mikroinjekcemi přímo k vlasovým kořínkům. Zlepšuje prokrvení pokožky hlavy, prodlužuje růstovou fázi vlasu a probouzí spící folikuly.
- **Ideální pro:** Zastavení difúzního a hormonálního padání vlasů, podporu léčby alopecie u mužů i žen a zahuštění řídnoucích vlasů.

#### Modelace rtů

- **Název v menu:** Modelace rtů
- **Preparáty:** Neauvia® Organic (přiřazení k ověření)

**H3: Modelace a hydratace rtů Neauvia® Organic**

- **Princip:** Prémiová organická kyselina hyaluronová síťovaná bezpečným polymerem PEG, který minimalizuje riziko otoků, zánětů a vzniku zatvrdlin.
- **Účinek:** Rty získají jemnou plnost, precizní kontury a hloubkovou hydrataci. Zákrok nezpůsobuje nepřirozený „kachní“ efekt – dbáme na harmonii horního a dolního rtu i anatomii vašeho obličeje.
- **Ideální pro:** Zvýraznění kontur rtů, jemné zvětšení objemu, korekci asymetrie a vyhlazení drobných periorálních vrásek.

#### Aplikace botulotoxinu

- **Název v menu:** Aplikace botulotoxinu
- **Preparáty:** Baby botox (přiřazení k ověření)

**H3: Baby botox a jemná relaxace mimiky**

- **Princip:** Aplikace certifikované látky uvolňující mimické svaly ve velmi nízkých, cílených mikrodávkách (tzv. Baby botox).
- **Účinek:** Na rozdíl od starších metod nezpůsobuje ztuhlou tvář bez emocí. Pouze jemně zklidňuje hyperaktivní svalová vlákna, díky čemuž se pokožka přirozeně vyhladí a nevznikají trvalé zlomy.
- **Ideální pro:** Vyhlazení mračivky mezi obočím, horizontálních vrásek na čele a jemných vějířků kolem očí při zachování plné a přirozené mimiky.

### Přístrojové ošetření

- **Název v menu:** Přístrojové ošetření (nadpis sekce ve zdroji: Přístrojová ošetření)
- **URL:** `/pristrojova-osetreni-praha/`
- **Klíčová slova:** přístrojová estetika Praha, Ultherapy Prime Praha, neinvazivní lifting obličeje, ultrazvukový lifting Praha, Dermapen 4 Praha, mikrojehličkování Praha, Plexr Praha, plazmové odstranění výrůstků
- **Meta title (59 znaků):** Přístrojová dermatologie Praha | Ultherapy Prime | Clinic by JuditH
- **Meta description (155 znaků):** Prémiová přístrojová dermatologie v Praze. Neinvazivní lifting Ultherapy® Prime, originální mikrojehličkování Dermapen™ 4 a plazmový Plexr® na výrůstky.
- **CTA:** Objednat se na konzultaci k přístrojovému ošetření

**Anotace na rozcestníku** (Špičková přístrojová ošetření):
Investujeme do zlatých standardů v oboru světové dermatologie. Provádíme originální medicinální mikrojehličkování Dermapen™ 4 pro vyhlazení jizev po akné a zpevnění textury pleti, neinvazivní ultrazvukový lifting Ultherapy® Prime pro obnovu hlubokých kontur obličeje bez operace a plazmovou mikrochirurgii Plexr® pro bezskalpelové odstranění kožních lézí.
Odkaz: „Prohlédnout přístrojová ošetření →“

**H1:** Špičková přístrojová ošetření v Praze: Technologie pro přirozené mládí

**Úvod:**
V Clinic by JuditH sázíme na technologie, které nenahrazují přirozenou strukturu tkáně, ale stimulují kůži k samoozdravné a omlazující aktivitě. Investujeme výhradně do celosvětově certifikovaných originálních přístrojů (zlatých standardů lékařské dermatologie), u kterých je bezpečnost i klinická účinnost podložena desítkami mezinárodních studií.

Naší absolutní vlajkovou lodí je nejmodernější ultrazvukový lifting Ultherapy® Prime, doplněný o precizní mikrojehličkování Dermapen™ 4 a plazmovou mikrochirurgii Plexr®.

**H2: Naše technologické portfolio** (přístroje jsou rozdělené do podprocedur níže)

**H2: Proč zvolit přístrojovou péči v Clinic by JuditH?**

- **Pouze certifikované originály:** Nikdy nepoužíváme asijské kopie či neověřené náhražky – pracujeme výhradně se špičkovými technologiemi s certifikací CE a FDA.
- **Vedení zkušeným lékařským týmem:** Nastavení parametrů Ultherapy®, Dermapenu i Plexru vždy přizpůsobujeme tloušťce a stavu vaší pokožky.
- **Okamžitý návrat do života:** Naše přístrojové metody poskytují maximální liftingový a regenerační efekt s nulovou nebo minimální dobou hojení.

#### Ultherapy® Prime

- **Název v menu:** Ultherapy® Prime (v menu ve zdroji „ULTERAPY PRIME“)

**H3: Ultherapy® Prime – Vlajková loď neinvazivního liftingu**
*Zlatý standard světové estetické medicíny v nové, ještě výkonnější a přesnější generaci.*

- **Princip ošetření:** Ultherapy® Prime využívá mikrofokusovaný ultrazvuk s vizualizací v reálném čase (MFU-V). Jako jediná neinvazivní technologie na světě dokáže bezpečně zacílit do hloubky 4,5 mm – přímo do tkáňové vrstvy SMAS, což je hloubka, se kterou dosud pracovala pouze klasická plastická chirurgie (facelift).
- **Bezkonkurenční bezpečnost a přesnost:** Lékař na obrazovce přesně vidí jednotlivé vrstvy vaší kůže a ultrazvukové impulsy směruje přesně tam, kde přinesou maximální efekt bez popálení okolní tkáně.
- **Co Ultherapy® Prime dokáže:**
  - Výrazné zpevnění spodní čelisti a vyhlazení podbradku (kontury obličeje),
  - Neinvazivní lifting obočí a otevření očního okolí,
  - Vyhlazení povadlé a vrásčité pokožky na krku a v dekoltu.
- **Výsledek:** Stačí jediné ošetření bez skalpelu a bez rekonvalescence. Kůže postupně vytváří novou pevnou kolagenovou síť, liftingový efekt nastupuje během 2–3 měsíců a přetrvává 1,5 až 2 roky.

#### Dermapen World – mikrojehličkování

- **Název v menu:** Dermapen World – mikrojehličkování

**H3: Dermapen™ 4 – Medicinální mikrojehličkování nové generace**
*Celosvětový etalon pro regeneraci textury pleti, léčbu jizev a sjednocení tónu.*

- **Princip ošetření:** Původní patentovaný přístroj Dermapen™ 4 vytváří pomocí mikroskopických jehliček až 1 920 mikrokanálků za sekundu. Tím spouští kaskádu přirozeného hojení a masivní tvorbu kolagenu a elastinu.
- **Hloubková infuze účinných látek:** Mikroskopickými kanálky vpravujeme hluboko do dermis vysoce koncentrovaná mezoterapeutická séra s kyselinou hyaluronovou, peptidy a antioxidanty.
- **Ideální pro:** Vyhlazení jizviček po akné, stažení rozšířených pórů, zjemnění jemných linek a redukci pigmentových skvrn na obličeji, krku i dekoltu. Pleť je po regeneraci hladká, hustá a sjednocená.

#### Plexr®

- **Název v menu:** Plexr®

**H3: Plexr® – Plazmové bezkontaktní odstranění výrůstků a lézí**
*Přesná mikrochirurgie čtvrtým skupenstvím hmoty – plazmou.*

- **Princip ošetření:** Přístroj generuje mikroskopický plazmový výboj mezi hrotem aplikátoru a pokožkou. Dochází k tzv. sublimaci (okamžitému odpaření) cílové tkáně, aniž by paprsek pronikal do hlubokých vrstev kůže nebo způsobil krvácení.
- **Nejšetrnější řešení pro kožní výrůstky:** Plexr® je ideální pro rychlé, bezkrevné a sterilní odstranění stopkatých fibromů, bradaviček, xantelazmat (tukových polštářků na víčkách) a senilních keratóz i v těch nejjemnějších partiích kolem očí.
- **Výsledek:** Zákrok nezanechává jizvy ani nutnost šití. Na místě ošetření vznikne drobný mikrostroupek, který během 5–7 dnů přirozeně odpadne.

#### Frakční laser (?)

- **Název v menu:** Frakční laser (ve zdroji s otazníkem)
- **Text:** – (chybí)

### Plastická chirurgie

- **Název v menu:** Plastická chirurgie (v menu ve zdroji „PLASTICKÉ CHIRURGIE“)
- **URL, meta, stránka:** – (chybí; existuje jen anotace na rozcestníku)

**Anotace na rozcestníku** (Plastická chirurgie: MUDr. Boris Jegorov):
Zákroky v oblasti obličeje vyžadují mimořádnou chirurgickou preciznost a estetický cit. Plastické a korektivní výkony na naší klinice vede vyhledávaný specialista MUDr. Boris Jegorov. Specializujeme se na ambulantní blefaroplastiku (korekci horních a dolních očních víček) prováděnou v šetrné lokální anestezii. Precizně vedený mikrořez v záhybu víčka odstraní převislou kůži i únavu zraku, zanechává téměř neviditelnou jizvu a navrací očím otevřený, mladistvý a odpočatý výraz.
Odkaz: „Více o plastické chirurgii a MUDr. Jegorovovi →“

#### Blefaroplastika

- **Název v menu:** Blefaroplastika (ve zdroji „i spodní?“)
- **Text:** – (chybí; zmínka jen v anotaci Plastické chirurgie výše)

#### Chirurgická excize

- **Název v menu:** Chirurgická excize
- **Text:** – (chybí)

#### Přímý brow lift

- **Název v menu:** Přímý brow lift
- **Text:** – (chybí)

---

## Otevřené otázky pro copywritera a kliniku

1. **Chybějící URL a meta:** Diagnostika TČM, Bylinná fytoterapie na míru (pole URL je prázdné), Injekční aplikace, Plastická chirurgie a všechny podprocedury.
2. **Chybějící texty:** Frakční laser, Blefaroplastika (vlastní stránka), Chirurgická excize, Přímý brow lift; Plastická chirurgie má jen anotaci.
3. **Frakční laser:** v menu s otazníkem. Bude v nabídce?
4. **Blefaroplastika „i spodní?“:** anotace Plastické chirurgie uvádí horní i dolní víčka. Platí obojí?
5. **Preparáty → podprocedury:** v podkladech jsou na jedné stránce. Přiřazení výše je odvozené (Radiesse® a RRS® HA Long Lasting jako biostimulace, Belotero® Revive jako biorevitalizace, RRS® HA Eyes jako mezoterapie, XL Hair® k vlasové pokožce, Neauvia® Organic k rtům, Baby botox k botulotoxinu). Souhlasí?
6. **Permanentní akupunktura, „Dáváme i hubnutí?“:** stránka uvádí indikaci „Efektivní a zdravé hubnutí“ a klíčové slovo „permanentní akupunktura na hubnutí“. Zůstává?
7. **Chinese Herbs Formula by JuditH:** copywriter se ptá, zda bude samostatná sekce, nebo stačí zmínka na stránce fytoterapie.
8. **Rozcestník Východní medicíny, „odkaz na by JuditH?“:** má z rozcestníku vést odkaz na stránku o značce?
9. **Meta title Západní medicíny** končí znakem „|“ bez názvu značky.
10. **Diagnostika TČM:** stránka nemá CTA; ostatní stránky ho mají.
11. **Neúplná věta v Diagnostice TČM:** „Judita Halvová, která tuto dovednost prohlubovala během svých stáží přímo v Číně.“ chybí přísudek.
12. **Název v menu „Diagnostika TČM (Základ každé úspěšné léčby)“:** má být závorka v menu, nebo jde o podtitul stránky?
13. **URL:** copywriter navrhuje ploché adresy (`/akupunktura-praha/`), web teď používá `/procedury/<kategorie>/<procedura>`. Je potřeba rozhodnout před přesměrováním.

## Úpravy oproti zdroji

- Odstraněné tučné písmo a kódové formátování celých odstavců, escapované znaky (`\|`, `2\.`) a nadbytečné mezery.
- Názvy v menu převedené z verzálek na běžná písmena; slova zůstala (ULTERAPY → Ultherapy®, jak píše copywriter v textu).
- Číslování podsekcí na rozcestníku vynecháno (pořadí určuje struktura; ve zdroji byla dvakrát „3.“).
- Nadpis „Klasická akupunktura“ sjednocen s menu a H1 na „Tradiční akupunktura“.
- „terapiích.Ta působí“ → „terapiích. Ta působí“; „produkty na péši o vlasy“ → „péči o vlasy“; „( atopický ekzém“ → „(atopický ekzém“.
- Radiesse®: „(CaHACaHACaHA)“ → „(CaHA)“, opakování při kopírování.
- Fytoterapie, perex: zástupný text „(url diagnostika)“ nahrazen poznámkou „(odkaz na Diagnostiku TČM)“.
- Text u indikace Dermatologie (Tradiční akupunktura) byl ve zdroji samostatnou odrážkou; připojen k nadpisu.
