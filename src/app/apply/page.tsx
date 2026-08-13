import { permanentRedirect } from "next/navigation"
import { JOIN_HREF } from "@/constants/site"

export default function ApplyPage() {
  permanentRedirect(JOIN_HREF)
}
