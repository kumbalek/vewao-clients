import Image from "next/image"

const MedusaCTA = () => {
  return (
    <div className="flex bg-black gap-x-2 txt-compact-small-plus items-center w-60 small:w-72 rounded-[3rem] p-2">
      <Image
        src={"/cart_footer.webp"}
        alt="Comgate footer"
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "100%", height: "auto" }}
      />
      {/* Powered by
      <a href="https://www.medusajs.com" target="_blank" rel="noreferrer">
        <Medusa fill="#9ca3af" className="fill-[#9ca3af]" />
      </a>
      &
      <a href="https://nextjs.org" target="_blank" rel="noreferrer">
        <NextJs fill="#9ca3af" />
      </a> */}
    </div>
  )
}

export default MedusaCTA
