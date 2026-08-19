"use client"

import * as React from "react"

import { GitHubGlyph } from "@/components/landing/brand-glyphs"
import type {
  ArticleEntry,
  CollectionEntry,
  CollectionGroup,
  CollectionPage,
} from "@/content/collections"
import { ArrowUpRight } from "@/lib/icons"
import { cn } from "@/lib/utils"

import { ArticleRow, CollectionRow } from "./collection-row"
import { PreviewProvider, type PreviewAnchor } from "./preview-popover"

/**
 * The 640 content column: title block, grouped rows, footer caption.
 *
 * Figma "Content" 20:1053 / 20:1306 / 20:1376 — identical in all three frames:
 *
 *   column          vertical, gap 24, pad 0 (the rows carry the 8)
 *   title block     pad H 8, gap 8 — Title (24) then one muted Body line
 *   group header    pad 8 / 0 / 4 / 8, Caption muted; on "Mine" it also
 *                   carries one quiet GitHub link, right-aligned
 *   labeled groups  32px between sections (mt-8), including Writing years
 *   rows            gap 0 — compact rows (h40 / h44 below lg), their radius
 *                   does the separating on hover
 *   footnote        pad H 12, Caption muted
 *
 * Everything from here down is client-side because the rows are preview
 * anchors. The DATA stays a server import: the page passes it in, and this
 * component holds no opinion about where it came from.
 */

/* ----------------------------------------------------------------------------
   Stack / Agents & skills
   ------------------------------------------------------------------------- */

export function CollectionList({
  page,
}: {
  page: CollectionPage<CollectionEntry>
}) {
  // A fresh array on every render is a fresh `anchors` prop, and `anchors` is
  // a dependency of the preview engine's mount effect — which builds the morph,
  // measures every card and re-registers the resize listener. The list is
  // static data; it should be built once.
  const anchors: PreviewAnchor[] = React.useMemo(
    () =>
      page.groups.flatMap((group) =>
        group.items.map((item) => ({
          key: `${group.id}-${item.id}`,
          title: item.name,
          preview: item.preview,
          href: item.href,
          external: Boolean(item.href),
        }))
      ),
    [page.groups]
  )

  return (
    <PreviewProvider anchors={anchors}>
      <Column
        page={page}
        renderRows={(group) =>
          group.items.map((item) => (
            <CollectionRow
              key={item.id}
              entry={item}
              previewKey={`${group.id}-${item.id}`}
            />
          ))
        }
      />
    </PreviewProvider>
  )
}

/* ----------------------------------------------------------------------------
   Writing
   ------------------------------------------------------------------------- */

export function ArticleList({ page }: { page: CollectionPage<ArticleEntry> }) {
  // Same reason as CollectionList above: the engine's mount effect keys on it.
  const anchors: PreviewAnchor[] = React.useMemo(
    () =>
      page.groups.flatMap((group) =>
        group.items.map((item) => ({
          key: `${group.id}-${item.id}`,
          title: item.title,
          preview: item.preview,
          href: item.href,
          external: false,
        }))
      ),
    [page.groups]
  )

  return (
    <PreviewProvider anchors={anchors}>
      <Column
        page={page}
        renderRows={(group) =>
          group.items.map((item) => (
            <ArticleRow
              key={item.id}
              entry={item}
              previewKey={`${group.id}-${item.id}`}
            />
          ))
        }
      />
    </PreviewProvider>
  )
}

/* ----------------------------------------------------------------------------
   The column itself
   ------------------------------------------------------------------------- */

function Column<T>({
  page,
  renderRows,
}: {
  page: CollectionPage<T>
  renderRows: (group: CollectionGroup<T>) => React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <header className="flex flex-col gap-2 px-2">
        <h1 className="text-2xl text-foreground">{page.title}</h1>
        <p className="text-pretty text-sm text-muted-foreground">
          {page.intro}
        </p>
      </header>

      <div className="flex flex-col">
        {page.groups.map((group) => (
          // The id is the wheel's scroll target. `[id]` carries a 96px
          // scroll-margin globally, so a click lands the header clear of the
          // top of the window.
          <section
            key={group.id}
            id={group.id}
            className={cn(
              "flex flex-col",
              // Labeled groups get a chapter break, including Writing years.
              !group.hideLabel && "mt-8 first:mt-0"
            )}
          >
            {/* items-center, not items-baseline: the GitHub glyph is an inline SVG
                whose baseline is its bottom edge, so a baseline row grows the
                header by 3px and every group below it drifts. */}
            {(!group.hideLabel || group.link) && (
            <div className="flex items-center justify-between px-2 pb-1">
              {!group.hideLabel && (
                <h2 className="text-xs text-muted-foreground">{group.label}</h2>
              )}

              {group.link && (
                <a
                  href={group.link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={[
                    "flex items-center gap-1.5 text-xs text-muted-foreground",
                    "[transition-property:color]",
                    "[transition-duration:var(--duration-fast)]",
                    "[transition-timing-function:var(--motion-glide)]",
                    "hover:text-foreground hover:[transition-duration:0ms]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                  ].join(" ")}
                >
                  <GitHubGlyph className="size-3.5" />
                  <span>{group.link.label}</span>
                  {/* The same "you are leaving" glyph as the rows, at the
                      header's smaller step — and at the contract's 1.5 stroke,
                      which nothing here was setting. */}
                  <ArrowUpRight className="size-3 [&]:[stroke-width:1.5]" />
                </a>
              )}
            </div>
            )}

            <div className="flex flex-col">{renderRows(group)}</div>
          </section>
        ))}
      </div>

      {page.footnote ? (
        <p className="px-2 text-xs text-muted-foreground">{page.footnote}</p>
      ) : null}
    </div>
  )
}
