"use client"

import { GitHubGlyph } from "@/components/landing/brand-glyphs"
import type {
  ArticleEntry,
  CollectionEntry,
  CollectionGroup,
  CollectionPage,
} from "@/content/collections"
import { ArrowUpRight } from "@/lib/icons"

import { ArticleRow, CollectionRow } from "./collection-row"
import { PreviewProvider, type PreviewAnchor } from "./preview-popover"

/**
 * The 640 content column: title block, grouped rows, footer caption.
 *
 * Figma "Content" 20:1053 / 20:1306 / 20:1376 — identical in all three frames:
 *
 *   column          vertical, gap 24, pad 0 (the rows carry the 12)
 *   title block     pad H 12, gap 8 — Title (24) then one muted Body line
 *   group header    pad 12 / 12 / 4 / 12, Caption muted; on "Mine" it also
 *                   carries one quiet GitHub link, right-aligned
 *   rows            gap 0 — the 48px rows stack flush, their radius does the
 *                   separating on hover
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
  const anchors: PreviewAnchor[] = page.groups.flatMap((group) =>
    group.items.map((item) => ({
      key: `${group.id}-${item.id}`,
      title: item.name,
      preview: item.preview,
    }))
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
   Articles
   ------------------------------------------------------------------------- */

export function ArticleList({ page }: { page: CollectionPage<ArticleEntry> }) {
  const anchors: PreviewAnchor[] = page.groups.flatMap((group) =>
    group.items.map((item) => ({
      key: `${group.id}-${item.id}`,
      title: item.title,
      preview: item.preview,
    }))
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
      <header className="flex flex-col gap-2 px-3">
        <h1 className="text-2xl text-foreground">{page.title}</h1>
        <p className="text-sm text-muted-foreground">{page.intro}</p>
      </header>

      <div className="flex flex-col">
        {page.groups.map((group) => (
          // The id is the wheel's scroll target. `[id]` carries a 96px
          // scroll-margin globally, so a click lands the header clear of the
          // top of the window.
          <section key={group.id} id={group.id} className="flex flex-col">
            {/* items-center, not items-baseline: the GitHub glyph is an inline SVG
                whose baseline is its bottom edge, so a baseline row grows the
                header by 3px and every group below it drifts. */}
            <div className="flex items-center justify-between px-3 pt-3 pb-1">
              <h2 className="text-xs text-muted-foreground">{group.label}</h2>

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
                  <ArrowUpRight className="size-3" />
                </a>
              )}
            </div>

            <div className="flex flex-col">{renderRows(group)}</div>
          </section>
        ))}
      </div>

      <p className="px-3 text-xs text-muted-foreground">{page.footnote}</p>
    </div>
  )
}
