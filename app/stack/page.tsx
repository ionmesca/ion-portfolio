import type { Metadata } from "next"

import { CollectionList } from "@/components/collections/collection-list"
import { CollectionShell } from "@/components/collections/collection-shell"
import { navFor, stackPage } from "@/content/collections"

export const metadata: Metadata = {
  title: "Stack — Ion Mesca",
  description: "What Ion Mesca still opens after the job is done.",
  alternates: { canonical: "/stack" },
}

/**
 * /stack — flavour 1 of the collection pattern.
 *
 * Figma "Stack — desktop light" 20:1033. Behaviour law:
 * docs/design/collection-lab.html. Tool rows with a real-site preview,
 * a three-line blurb and a domain caption; the wheel lists the categories.
 */
export default function StackPage() {
  return (
    <CollectionShell nav={navFor(stackPage)} label="Stack sections">
      <CollectionList page={stackPage} />
    </CollectionShell>
  )
}
