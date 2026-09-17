import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Heading } from "@medusajs/ui"
import Help from "@modules/order/components/help"
import { useTranslations } from "next-intl"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("termsTitle"),
  }
}

export default function TermsPage() {
  const t = useTranslations("termsOfUse")

  return (
    <div className="py-6 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
        <div
          className="flex flex-col gap-4 max-w-4xl h-full bg-white w-full py-10"
          data-testid="order-complete-container"
        >
          <Heading
            level="h1"
            className="flex flex-col gap-y-3 text-ui-fg-base text-3xl mb-4"
          >
            {t("title")}
          </Heading>
          <div className="bg-zinc-50 font-sans p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-lg text-gray-800 leading-relaxed">
              {/* Seller Information */}
              <section className="mb-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xl  text-gray-800 mb-4">Prodávající:</h3>
                <div className="space-y-1 text-gray-700">
                  <p>
                    <strong>Mgr. Judita Halvová</strong>
                  </p>
                  <p>
                    <strong>IČ:</strong> 64417441
                  </p>
                  <p>
                    <strong>DIČ:</strong> CZ77661080151
                  </p>
                  <p>
                    <strong>místem podnikání:</strong> Emilie Hyblerová 524/11,
                    Praha 4 - Háje, PSČ: 149 00
                  </p>
                  <p>
                    fyzická osoba podnikající na základě živnostenského
                    oprávnění
                  </p>
                  <p>
                    <strong>kontaktní osoba:</strong> Mgr. Judita Halvová
                  </p>
                  <p>
                    <strong>email:</strong>{" "}
                    <a
                      href="mailto:info@bbclinic.cz"
                      className="text-[#85977b] "
                    >
                      info@bbclinic.cz
                    </a>
                  </p>
                  <p>
                    <strong>telefon:</strong>{" "}
                    <a href="tel:+420720980530" className="text-[#85977b] ">
                      + 420 720 980 530
                    </a>
                  </p>
                  <p>
                    <strong>web:</strong>{" "}
                    <a
                      href="https://www.by-judith.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#85977b] "
                    >
                      https://www.by-judith.com/
                    </a>
                  </p>
                  <p className="mt-4">
                    (dále jen „
                    <strong className="font-semibold">prodávající</strong>“)
                  </p>
                </div>
              </section>

              <div className="space-y-12">
                {/* I. ZÁKLADNÍ USTANOVENÍ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    I. ZÁKLADNÍ USTANOVENÍ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Tyto všeobecné obchodní podmínky prodávajícího pro e-shop
                      (dále jen „
                      <strong className="font-semibold">
                        obchodní podmínky
                      </strong>
                      “) upravují v souladu s ust. § 1751 a násl. zákona č.
                      89/2012 Sb., občanský zákoník (dále jen „
                      <strong className="font-semibold">
                        občanský zákoník
                      </strong>
                      “) a zákonem č. 374/2022 Sb., o ochraně spotřebitele,
                      vzájemná práva a povinnosti prodávajícího a (i) fyzické
                      osoby, která uzavírá kupní smlouvu mimo svoji
                      podnikatelskou činnost jako spotřebitel, nebo (ii)
                      jakékoli osoby v rámci své podnikatelské činnosti, (dále
                      jen „<strong className="font-semibold">kupující</strong>“)
                      prostřednictvím internetového obchodu prodávajícího
                      provozovaného na webové stránce dostupné na internetové
                      adrese{" "}
                      <a
                        href="https://www.by-judith.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#85977b] "
                      >
                        https://www.by-judith.com/
                      </a>{" "}
                      (dále je „
                      <strong className="font-semibold">
                        internetový obchod
                      </strong>
                      “), a to prostřednictvím rozhraní webové stránky (dále jen
                      „
                      <strong className="font-semibold">
                        webové rozhraní obchodu
                      </strong>
                      “).
                    </p>
                    <p>
                      Ustanovení obchodních podmínek jsou nedílnou součástí
                      kupní smlouvy uzavřené mezi prodávajícím a kupujícím.
                    </p>
                    <p>
                      Odchylná ujednání v kupní smlouvě mají přednost před
                      ustanoveními těchto obchodních podmínek.
                    </p>
                    <p>
                      Uzavřením kupní smlouvy kupující stvrzuje, že se s
                      obchodními podmínkami seznámil a že s nimi souhlasí.
                    </p>
                    <p>
                      Tyto obchodní podmínky a kupní smlouva se uzavírají v
                      českém jazyce.
                    </p>
                  </div>
                </section>

                {/* II. ZÁKAZNICKÝ ÚČET */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    II. ZÁKAZNICKÝ ÚČET
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Na základě registrace kupujícího provedené v internetovém
                      obchodě může kupující přistupovat do svého uživatelského
                      rozhraní.
                    </p>
                    <p>
                      Ze svého uživatelského rozhraní může kupující provádět
                      objednávání zboží (dále jen „
                      <strong className="font-semibold">zákaznický účet</strong>
                      “). Kupující může objednávat zboží také bez registrace
                      přímo z webového rozhraní obchodu.
                    </p>
                    <p>
                      Při registraci do zákaznického účtu a při objednávání
                      zboží je kupující povinen uvádět správně a pravdivě
                      všechny údaje. Údaje uvedené v uživatelském účtu je
                      kupující při jakékoliv jejich změně povinen aktualizovat.
                    </p>
                    <p>
                      Odpovědnost za správnost a úplnost údajů uvedených
                      kupujícím v zákaznickém účtu nese výhradně kupující.
                    </p>
                    <p>
                      Přístup k zákaznickému účtu je zabezpečen uživatelským
                      jménem a heslem. Kupující je povinen zachovávat
                      mlčenlivost ohledně informací nezbytných k přístupu do
                      jeho zákaznického účtu.
                    </p>
                    <p>
                      Prodávající nenese odpovědnost za případné zneužití
                      zákaznického účtu třetími osobami. Kupující není oprávněn
                      umožnit využívání zákaznického účtu třetím osobám.
                    </p>
                    <p>
                      Prodávající může zrušit uživatelský účet, a to zejména v
                      případě, kdy kupující svůj uživatelský účet déle než 12
                      měsíců nevyužívá, či v případě, kdy kupující poruší své
                      povinnosti z kupní smlouvy nebo těchto obchodních
                      podmínek.
                    </p>
                    <p>
                      Kupující bere na vědomí, že uživatelský účet nemusí být
                      dostupný nepřetržitě, a to zejména s ohledem na nutnou
                      údržbu hardwarového a softwarového vybavení prodávajícího,
                      popř. nutnou údržbu hardwarového a softwarového vybavení
                      třetích osob.
                    </p>
                  </div>
                </section>

                {/* III. INFORMACE O ZBOŽÍ A CENÁCH */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    III. INFORMACE O ZBOŽÍ A CENÁCH
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Informace o zboží, včetně cen jednotlivého zboží a jeho
                      hlavních vlastností, jsou uvedeny u jednotlivého zboží v
                      katalogu internetového obchodu.
                    </p>
                    <p>
                      Ceny zboží jsou uvedeny včetně daně z přidané hodnoty,
                      všech souvisejících poplatků a nákladů za vrácení zboží,
                      jestliže toto zboží ze své podstaty nemůže být vráceno
                      obvyklou poštovní cestou. Ceny zboží zůstávají v platnosti
                      po dobu, po kterou jsou zobrazovány v internetovém
                      obchodě.
                    </p>
                    <p>
                      Toto ustanovení nevylučuje sjednání kupní smlouvy za
                      individuálně sjednaných podmínek.
                    </p>
                    <p>
                      Veškerá prezentace zboží umístěná v katalogu internetového
                      obchodu je informativního charakteru a prodávající není
                      povinen uzavřít kupní smlouvu ohledně tohoto zboží.
                      Ustanovení § 1732 odst. 2 občanského zákoníku se
                      nepoužije.
                    </p>
                    <p>
                      V internetovém obchodě jsou zveřejněny informace o
                      nákladech spojených s balením a dodáním zboží. Informace o
                      nákladech spojených s balením a dodáním zboží uvedené v
                      internetovém obchodě platí pouze v případech, kdy je zboží
                      doručováno v rámci území České republiky.
                    </p>
                    <p>
                      Případné slevy z kupní ceny zboží nelze navzájem
                      kombinovat, nedohodne-li se prodávající s kupujícím jinak.
                    </p>
                  </div>
                </section>

                {/* IV. POSTUP PŘI UZAVŘENÍ KUPNÍ SMLOUVY */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    IV. POSTUP PŘI UZAVŘENÍ KUPNÍ SMLOUVY
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Náklady vzniklé kupujícímu při použití komunikačních
                      prostředků na dálku v souvislosti s uzavřením kupní
                      smlouvy (náklady na internetové připojení, náklady na
                      telefonní hovory), hradí kupující sám.
                    </p>
                    <p>Kupující provádí objednávku zboží těmito způsoby:</p>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                      <li>
                        prostřednictvím svého zákaznického účtu, provedl-li
                        předchozí registraci v internetovém obchodě,
                      </li>
                      <li>
                        vyplněním objednávkového formuláře bez registrace.
                      </li>
                    </ul>
                    <p>
                      Při zadávání objednávky zboží vyplní kupující objednávkový
                      formulář ve webovém rozhraní internetového obchodu, který
                      obsahuje zejména informace o:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                      <li>
                        objednávaném zboží, jeho typu a množství (objednávané
                        zboží kupující „vloží“ do elektronického nákupního
                        košíku webového rozhraní obchodu);
                      </li>
                      <li>způsobu úhrady kupní ceny zboží;</li>
                      <li>požadovaném způsobu doručení objednávaného zboží;</li>
                      <li>nákladech spojených s dodáním zboží.</li>
                    </ul>
                    <p>
                      (dále společně jen jako „
                      <strong className="font-semibold">objednávka</strong>“).
                    </p>
                    <p>
                      Před odesláním objednávky je kupujícímu umožněno
                      kontrolovat a měnit údaje, které do objednávky vložil.
                      Objednávku odešle kupující prodávajícímu kliknutím na
                      tlačítko „Odeslat objednávku“. Údaje uvedené v objednávce
                      jsou prodávajícím považovány za správné.
                    </p>
                    <p>
                      Podmínkou platnosti objednávky je vyplnění všech povinných
                      údajů v objednávkovém formuláři a potvrzení kupujícího o
                      tom, že se seznámil s těmito obchodními podmínkami.
                    </p>
                    <p>
                      Neprodleně po obdržení objednávky zašle prodávající
                      kupujícímu potvrzení o obdržení objednávky na emailovou
                      adresu, kterou kupující při objednání zadal nebo uvedl ve
                      svém zákaznickém účtu (dále jen „
                      <strong className="font-semibold">
                        elektronická adresa kupujícího
                      </strong>
                      “). Toto potvrzení je automatické a nepovažuje se za
                      uzavření smlouvy. Přílohou potvrzení jsou aktuální
                      obchodní podmínky prodávajícího.
                    </p>
                    <p>
                      Kupní smlouva je uzavřena až po přijetí objednávky
                      prodávajícím. Oznámení o přijetí objednávky je doručeno na
                      emailovou adresu kupujícího. Okamžikem doručení potvrzení
                      o přijetí objednávky na e-mailovou adresu kupujícího je
                      uzavřena kupní smlouva.
                    </p>
                    <p>
                      V případě, že některý z požadavků uvedených v objednávce
                      nemůže prodávající splnit, zašle kupujícímu na jeho
                      e-mailovou adresu pozměněnou nabídku. Pozměněná nabídka se
                      považuje za nový návrh kupní smlouvy a kupní smlouva je v
                      takovém případě uzavřena potvrzením kupujícího o přijetí
                      této nabídky prodávajícímu na jeho e-mailovou adresu
                      uvedenu v těchto obchodních podmínkách.
                    </p>
                    <p>
                      Kupující je oprávněn zrušit objednávku, dokud není
                      kupujícímu doručeno oznámení o přijetí objednávky
                      prodávajícím. Kupující může zrušit objednávku telefonicky
                      na telefonním čísle nebo e-mailem na e-mailovou adresu
                      prodávajícího uvedené v těchto obchodních podmínkách.
                    </p>
                    <p>
                      V případě, že došlo ke zjevné technické chybě na straně
                      prodávajícího při uvedení ceny zboží v internetovém
                      obchodě, nebo v průběhu objednávání, není prodávající
                      povinen dodat kupujícímu zboží za tuto zcela zjevně
                      chybnou cenu. Prodávající informuje kupujícího o chybě bez
                      zbytečného odkladu a zašle kupujícímu na jeho e-mailovou
                      adresu pozměněnou nabídku. Pozměněná nabídka se považuje
                      za nový návrh kupní smlouvy a kupní smlouva je v takovém
                      případě uzavřena doručením potvrzením o přijetí nabídky
                      kupujícím na e-mailovou adresu prodávajícího.
                    </p>
                  </div>
                </section>

                {/* V. PLATEBNÍ PODMÍNKY A DODÁNÍ ZBOŽÍ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    V. PLATEBNÍ PODMÍNKY A DODÁNÍ ZBOŽÍ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Cenu zboží a případné náklady spojené s dodáním zboží dle
                      kupní smlouvy může kupující uhradit následujícími způsoby:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                      <li>
                        bezhotovostně platební kartou online přes platební bránu
                        společnosti Comgate;
                      </li>
                      <li>
                        bezhotovostně převodem na účet prodávajícího
                        prostřednictvím platební brány Comgate.
                      </li>
                    </ul>
                    <p>
                      Společně s kupní cenou je kupující povinen uhradit
                      prodávajícímu náklady spojené s balením a dodáním zboží ve
                      smluvené výši. Není-li dále uvedeno výslovně jinak, rozumí
                      se dále kupní cenou i náklady spojené s dodáním zboží.
                    </p>
                    <p>
                      V případě bezhotovostní platby je kupní cena splatná do 7
                      dnů ode dne uzavření kupní smlouvy. Závazek kupujícího
                      uhradit kupní cenu je splněn okamžikem připsání příslušné
                      částky na bankovní účet prodávajícího.
                    </p>
                    <p>
                      Prodávající nepožaduje od kupujícího předem žádnou zálohu
                      či jinou obdobnou platbu. Úhrada kupní ceny před odesláním
                      zboží není zálohou.
                    </p>
                    <p>
                      Podle zákona o evidenci tržeb je prodávající povinen
                      vystavit kupujícímu daňový doklad. Zároveň je povinen
                      zaevidovat přijatou tržbu u správce daně on-line, v
                      případě technického výpadku pak nejpozději do 48 hodin.
                    </p>
                    <p>Zboží může být kupujícímu dodáno:</p>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                      <li>na adresu určenou kupujícím v objednávce;</li>
                      <li>osobním odběrem v provozovně prodávajícího;</li>
                      <li>
                        v případě dárkových poukazů a voucherů na e-mailovou
                        adresu kupujícího.
                      </li>
                    </ul>
                    <p>
                      Náklady na dodání zboží v závislosti na způsobu odeslání a
                      převzetí zboží jsou uvedeny v objednávce kupujícího a v
                      potvrzení objednávky prodávajícím. V případě, že je způsob
                      dopravy smluven na základě zvláštního požadavku
                      kupujícího, nese kupující riziko a případné dodatečné
                      náklady spojené s tímto způsobem dopravy.
                    </p>
                    <p>
                      Je-li prodávající podle kupní smlouvy povinen dodat zboží
                      na místo určené kupujícím v objednávce, je kupující
                      povinen převzít zboží při dodání. V případě, že je z
                      důvodů na straně kupujícího nutno zboží doručovat
                      opakovaně nebo jiným způsobem, než bylo uvedeno v
                      objednávce, je kupující povinen uhradit náklady spojené s
                      opakovaným doručováním zboží, resp. náklady spojené s
                      jiným způsobem doručení.
                    </p>
                    <p>
                      Při převzetí zboží od přepravce je kupující povinen
                      zkontrolovat neporušenost obalů zboží a v případě
                      jakýchkoliv závad toto neprodleně oznámit přepravci. V
                      případě shledání porušení obalu svědčícího o neoprávněném
                      vniknutí do zásilky nemusí kupující zásilku od přepravce
                      převzít.
                    </p>
                    <p>
                      Kupující nabývá vlastnické právo ke zboží zaplacením celé
                      kupní ceny za zboží, včetně nákladů na dodání, nejdříve
                      však převzetím zboží. Odpovědnost za nahodilou zkázu,
                      poškození či ztrátu zboží přechází na kupujícího okamžikem
                      převzetí zboží nebo okamžikem, kdy měl kupující povinnost
                      zboží převzít, ale v rozporu s kupní smlouvou tak
                      neučinil.
                    </p>
                  </div>
                </section>

                {/* VI. ODSTOUPENÍ OD SMLOUVY */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    VI. ODSTOUPENÍ OD SMLOUVY
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Kupující, který uzavřel kupní smlouvu mimo svoji
                      podnikatelskou činnost jako spotřebitel, má právo od kupní
                      smlouvy odstoupit ve lhůtě 14 dnů ode dne převzetí zboží,
                      a to i bez udání důvodu.
                    </p>
                    <p>
                      Kupující nemůže odstoupit od kupní smlouvy o dodávce zboží
                      v zapečetěném obalu, které kupující z obalu vyňal a z
                      hygienických důvodů jej není možné vrátit, nebo v dalších
                      případech uvedených v § 1837 občanského zákoníku.
                    </p>
                    <p>
                      Pro dodržení lhůty k odstoupení od smlouvy musí kupující
                      odeslat prohlášení o odstoupení ve lhůtě pro odstoupení od
                      smlouvy. V případě odstoupení od kupní smlouvy kupující
                      informuje o této skutečnosti prodávajícího e-mailem,
                      případně i s uvedením důvodu, nebo pošle vyjádření na
                      doručovací adresu prodávajícího uvedenou v těchto
                      obchodních podmínkách.
                    </p>
                    <p>
                      Kupující, který odstoupil od smlouvy, je povinen vrátit
                      prodávajícímu zboží do 14 dnů od doručení oznámení o
                      odstoupení od smlouvy prodávajícímu. Kupující nese náklady
                      spojené s navrácením zboží prodávajícímu.
                    </p>
                    <p>
                      Odstoupí-li kupující od smlouvy, vrátí mu prodávající
                      bezodkladně, nejpozději však do 14 dnů od doručení
                      oznámení o odstoupení od smlouvy, celou kupní cenu zboží
                      včetně nákladů na dodání, které od něho přijal, a to
                      stejným způsobem.
                    </p>
                    <p>
                      Jestliže kupující zvolil jiný než nejlevnější způsob
                      dodání zboží, který prodávající nabízí, vrátí prodávající
                      kupujícímu náklady na dodání zboží ve výši odpovídající
                      nejlevnějšímu nabízenému způsobu dodání zboží.
                    </p>
                    <p>
                      Odstoupí-li kupující od kupní smlouvy, není prodávající
                      povinen vrátit přijaté peněžní prostředky kupujícímu
                      dříve, než mu kupující zboží předá nebo prokáže, že zboží
                      prodávajícímu odeslal.
                    </p>
                    <p>
                      Zboží musí vrátit kupující prodávajícímu nepoškozené,
                      neopotřebené a neznečištěné a je-li to možné, v původním
                      obalu. Nárok na náhradu škody vzniklé na zboží je
                      prodávající oprávněn jednostranně započíst proti nároku
                      kupujícího na vrácení kupní ceny.
                    </p>
                    <p>
                      Prodávající je oprávněn odstoupit od kupní smlouvy z
                      důvodu vyprodání zásob, nedostupnosti zboží, anebo když
                      výrobce, dovozce anebo dodavatel zboží přerušil výrobu
                      nebo dovoz zboží. Prodávající bezodkladně informuje
                      kupujícího a vrátí ve lhůtě 14 dnů od oznámení celou kupní
                      cenu.
                    </p>
                  </div>
                </section>

                {/* VII. PRÁVA Z VADNÉHO PLNĚNÍ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    VII. PRÁVA Z VADNÉHO PLNĚNÍ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Prodávající odpovídá kupujícímu, že zboží při převzetí
                      nemá vady. Zejména prodávající odpovídá kupujícímu, že v
                      době, kdy kupující zboží převzal:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2">
                      <li>
                        má zboží vlastnosti, které si strany ujednaly, a
                        chybí-li ujednání, má takové vlastnosti, které
                        prodávající nebo výrobce popsal nebo které kupující
                        očekával s ohledem na povahu zboží a na základě reklamy
                        jimi prováděné,
                      </li>
                      <li>
                        se zboží hodí k účelu, který pro jeho použití
                        prodávající uvádí nebo ke kterému se zboží tohoto druhu
                        obvykle používá,
                      </li>
                      <li>
                        zboží odpovídá jakostí nebo provedením smluvenému vzorku
                        nebo předloze, byla-li jakost nebo provedení určeno
                        podle smluveného vzorku nebo předlohy,
                      </li>
                      <li>
                        je zboží v odpovídajícím množství, míře nebo hmotnosti a
                      </li>
                      <li>zboží vyhovuje požadavkům právních předpisů.</li>
                    </ul>
                    <p>
                      Práva z vadného plnění uplatňuje kupující u prodávajícího
                      na adrese jeho provozovny, v níž je přijetí reklamace
                      možné s ohledem na sortiment prodávaného zboží, případně i
                      v sídle nebo místě podnikání.
                    </p>
                    <p>
                      Další práva a povinnosti stran související s odpovědností
                      prodávajícího za vady může upravit reklamační řád
                      prodávajícího.
                    </p>
                  </div>
                </section>

                {/* VIII. OCHRANA OSOBNÍCH ÚDAJŮ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    VIII. OCHRANA OSOBNÍCH ÚDAJŮ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Prodávající je správcem osobních údajů kupujícího. Veškeré
                      informace o zpracování osobních údajů jsou dostupné zde:{" "}
                      <a
                        href="https://www.by-judith.com/cz/content/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#85977b] "
                      >
                        https://www.by-judith.com/cz/content/privacy-policy
                      </a>
                      .
                    </p>
                  </div>
                </section>

                {/* IX. DORUČOVÁNÍ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    IX. DORUČOVÁNÍ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Smluvní strany si mohou veškerou písemnou korespondenci
                      vzájemně doručovat prostřednictvím elektronické pošty.
                    </p>
                    <p>
                      Kupující doručuje prodávajícímu korespondenci na
                      e-mailovou adresu uvedenou v těchto obchodních podmínkách.
                      Prodávající doručuje kupujícímu korespondenci na
                      e-mailovou adresu uvedenou v jeho zákaznickém účtu nebo v
                      objednávce.
                    </p>
                  </div>
                </section>

                {/* X. MIMOSOUDNÍ ŘEŠENÍ SPORŮ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    X. MIMOSOUDNÍ ŘEŠENÍ SPORŮ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      K mimosoudnímu řešení spotřebitelských sporů z kupní
                      smlouvy je příslušná Česká obchodní inspekce, se sídlem
                      Štěpánská 567/15, 120 00 Praha 2, IČ: 000 20 869, web:{" "}
                      <a
                        href="https://adr.coi.cz/cs"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#85977b] "
                      >
                        https://adr.coi.cz/cs
                      </a>
                      .
                    </p>
                    <p>
                      K mimosoudnímu řešení spotřebitelských sporů lze také
                      využít on-line Platformu pro řešení sporů na webové adrese{" "}
                      <a
                        href="http://ec.europa.eu/consumers/odr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#85977b] "
                      >
                        http://ec.europa.eu/consumers/odr
                      </a>
                      .
                    </p>
                    <p>
                      Evropské spotřebitelské centrum Česká republika, se sídlem
                      Štěpánská 567/15, 120 00 Praha 2, webová adresa:{" "}
                      <a
                        href="http://www.evropskyspotrebitel.cz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#85977b] "
                      >
                        http://www.evropskyspotrebitel.cz
                      </a>{" "}
                      je kontaktním místem podle Nařízení Evropského parlamentu
                      a Rady (EU) č. 524/2013.
                    </p>
                    <p>
                      Prodávající je oprávněn k prodeji zboží na základě
                      živnostenského oprávnění. Živnostenskou kontrolu provádí v
                      rámci své působnosti příslušný živnostenský úřad. Dozor
                      nad oblastí ochrany osobních údajů vykonává Úřad pro
                      ochranu osobních údajů.
                    </p>
                  </div>
                </section>

                {/* XI. ZÁVĚREČNÁ USTANOVENÍ */}
                <section>
                  <h3 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    XI. ZÁVĚREČNÁ USTANOVENÍ
                  </h3>
                  <div className="space-y-4">
                    <p>
                      Veškerá ujednání mezi prodávajícím a kupujícím se řídí
                      právním řádem České republiky. Pokud vztah založený kupní
                      smlouvou obsahuje mezinárodní prvek, pak strany
                      sjednávají, že vztah se řídí právem České republiky.
                    </p>
                    <p>
                      Všechna práva k webovým stránkám prodávajícího, zejména
                      autorská práva k obsahu, včetně rozvržení stránky, fotek,
                      filmů, grafik, ochranných známek, loga a dalšího obsahu a
                      prvků, náleží prodávajícímu. Je zakázáno kopírovat,
                      upravovat nebo jinak používat webové stránky nebo jejich
                      část bez souhlasu prodávajícího.
                    </p>
                    <p>
                      Kupní smlouva včetně obchodních podmínek je archivována
                      prodávajícím v elektronické podobě a není přístupná.
                    </p>
                    <p>
                      Znění obchodních podmínek může prodávající kdykoli
                      jednostranně měnit či doplňovat. Pro příslušnou kupní
                      smlouvu je vždy rozhodné znění obchodních podmínek, které
                      bylo součástí dané kupní smlouvy v okamžiku jejího
                      uzavření.
                    </p>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <footer className="mt-12 pt-6 border-t border-gray-200 text-gray-600">
                <p>Tyto obchodní podmínky nabývají účinnosti dnem 1.10.2025</p>
              </footer>
            </div>
          </div>
          <Help />
        </div>
      </div>
    </div>
  )
}
