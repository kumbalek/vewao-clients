import Spinner from "@modules/common/icons/spinner"

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center py-24 text-ink">
      <Spinner size={36} />
    </div>
  )
}
