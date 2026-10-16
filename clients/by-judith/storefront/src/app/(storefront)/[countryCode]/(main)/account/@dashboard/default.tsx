import { notFound } from "next/navigation"

// Next 16 requires a default for every parallel route slot. An account path the
// dashboard does not have is a 404, as it was implicitly before Next 16.
export default function Default() {
  notFound()
}
