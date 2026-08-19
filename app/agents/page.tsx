import type { Metadata } from "next"

import { CollectionList } from "@/components/collections/collection-list"
import { CollectionShell } from "@/components/collections/collection-shell"
import { agentsPage, navFor } from "@/content/collections"

export const metadata: Metadata = {
  title: "Agents & skills — Ion Mesca",
  description: "Skills Ion Mesca runs, and the ones he wrote.",
  alternates: { canonical: "/agents" },
}

/**
 * /agents — flavour 2 of the collection pattern.
 *
 * Figma "Agents & skills — desktop light" 20:1293. Adds the credit line,
 * shares Stack's tool-preview face, and swaps the ↗ for an install chip
 * on Ion's own skills.
 */
export default function AgentsPage() {
  return (
    <CollectionShell nav={navFor(agentsPage)} label="Agents & skills sections">
      <CollectionList page={agentsPage} />
    </CollectionShell>
  )
}
