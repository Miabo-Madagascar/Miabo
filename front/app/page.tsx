/**
 * Page racine — redirige vers la locale par défaut (fr).
 * Le middleware gère aussi cette redirection.
 */

import { redirect } from "next/navigation"

export default function RootPage() {
  redirect("/fr")
}
