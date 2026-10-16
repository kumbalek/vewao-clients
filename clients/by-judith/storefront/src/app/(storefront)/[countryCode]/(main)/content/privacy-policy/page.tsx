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
    title: t("privacyTitle"),
  }
}

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacyPolicy")

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
              {/* Header */}
              <header className="text-center mb-10 border-b pb-6">
                <h1 className="text-3xl sm:text-4xl text-gray-900 mb-2">
                  Ochrana osobních údajů
                </h1>
                <p className="text-md text-gray-600">
                  Naše webová adresa je:{" "}
                  <a
                    href="https://www.by-judith.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#85977b] "
                  >
                    https://www.by-judith.com/
                  </a>
                </p>
              </header>

              <div className="space-y-12">
                {/* Úvodní sekce */}
                <section>
                  <h2 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    Jaké shromažďujeme osobní údaje a proč je shromažďujeme
                  </h2>
                </section>

                {/* Cookies */}
                <section>
                  <h2 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    Cookies
                  </h2>
                  <div className="space-y-4">
                    <p>
                      Pokud na naše stránky přidáte komentář, můžete povolit
                      uložení jména, emailové adresy a webové stránky do
                      cookies. Tímto způsobem se snažíme zvýšit váš komfort,
                      když budete psát nový komentář už pak nebudete muset tyto
                      údaje znovu vyplňovat. Tyto soubory cookies budou mít
                      životnost jeden rok.
                    </p>
                    <p>
                      Pokud máte účet a přihlašujete se k tomuto webu, nastavíme
                      dočasné cookie pro ověření, zda váš prohlížeč přijímá
                      soubory cookies. Tento soubor cookie neobsahuje žádná
                      osobní data a při zavření prohlížeče se zruší.
                    </p>
                    <p>
                      Při přihlašování vám nastavíme také několik souborů
                      cookies pro uložení vašich přihlašovacích údajů a pro
                      nastavení zobrazení obrazovky. Přihlašovací soubory
                      cookies mají životnost dva dny a cookies pro nastavení
                      zobrazení mají životnost jeden rok. Pokud potvrdíte
                      možnost „Zapamatovat si mě“, vaše přihlášení bude trvat
                      dva týdny. Pokud se ze svého účtu odhlásíte, přihlašovací
                      cookies budou odstraněny.
                    </p>
                    <p>
                      Pokud upravujete nebo publikujete článek, bude ve vašem
                      prohlížeči uložen další cookie. Tento cookie neobsahuje
                      žádná osobní data a jednoduše označuje ID příspěvku, který
                      jste právě upravili. Jeho platnost vyprší po 1 dni.
                    </p>
                  </div>
                </section>

                {/* Vložený obsah */}
                <section>
                  <h2 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    Vložený obsah z dalších webů
                  </h2>
                  <div className="space-y-4">
                    <p>
                      Příspěvky na těchto stránkách mohou obsahovat vložený
                      obsah (například videa, obrázky, články atd.). Vložený
                      obsah z jiných webových stránek se chová stejným způsobem,
                      jako kdyby návštěvník navštívil jiný web.
                    </p>
                    <p>
                      Tyto webové stránky mohou shromažďovat data o vás,
                      používat soubory cookies, vkládat další sledování od
                      třetích stran a sledovat vaši interakci s tímto vloženým
                      obsahem, včetně sledování interakce s vloženým obsahem,
                      pokud máte účet a jste přihlášeni na danou webovou
                      stránku.
                    </p>
                  </div>
                </section>

                {/* Analytika a sdílení dat */}
                <section>
                  <h2 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    Analytika a sdílení údajů
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl  text-gray-800 mb-2">
                        Jak dlouho uchováváme vaše údaje
                      </h3>
                      <p>
                        Pokud přidáte komentář, komentář a jeho metadata budou
                        uchovávána po dobu neurčitou. Údaje jsou uchovávány za
                        účelem automatického rozpoznání a schválení všech
                        následných komentářů, místo jejich držení ve frontě
                        moderování.
                      </p>
                      <p className="mt-4">
                        Pro uživatele, kteří se registrují na tomto webu (pokud
                        mají tuto možnost), ukládáme také osobní údaje, které
                        uvádějí ve svém uživatelském profilu. Všichni uživatelé
                        mohou kdykoliv vidět, upravovat nebo smazat své osobní
                        údaje (s výjimkou toho, že nemohou změnit své
                        uživatelské jméno). Administrátoři webu mohou také tyto
                        informace zobrazit a upravovat.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Vaše práva */}
                <section>
                  <h2 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    Jaká máte práva?
                  </h2>
                  <div className="space-y-4">
                    <p>
                      Pokud máte na tomto webu účet nebo jste zde přidali
                      komentáře, můžete požádat o obdržení souboru s exportem
                      osobních údajů, které o vás uchováváme, včetně všech
                      údajů, které jste nám poskytli. Můžete také požádat o
                      odstranění veškerých osobních údajů, které o vás
                      uchováváme. Tato možnost nezahrnuje údaje, které jsme
                      povinni uchovávat z administrativních, právních nebo
                      bezpečnostních důvodů.
                    </p>
                  </div>
                </section>

                {/* Kam posíláme data */}
                <section>
                  <h2 className="text-2xl  mb-4 pb-2 border-b border-gray-200">
                    Kam posíláme vaše data?
                  </h2>
                  <div className="space-y-4">
                    <p>
                      Komentáře návštěvníků mohou být kontrolovány
                      prostřednictvím automatizované služby detekce spamu, která
                      může být umístěna v zahraničí.
                    </p>
                  </div>
                </section>
              </div>

              {/* Footer - můžete nechat prázdný nebo přidat relevantní informace */}
              <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500">
                <p>
                  &copy; {new Date().getFullYear()} BEAUTY BODY CLINIC. Všechna
                  práva vyhrazena.
                </p>
              </footer>
            </div>
          </div>
          <Help />
        </div>
      </div>
    </div>
  )
}
