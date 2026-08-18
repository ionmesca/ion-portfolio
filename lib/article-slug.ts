/**
 * `headingSlug` — the ONE function that turns an article's h2 text into an id.
 *
 * It lives alone in this file because two very different modules need it and
 * neither may drag the other's dependencies along:
 *
 *   mdx-components.tsx   renders `<h2 id={headingSlug(text)}>`
 *   lib/articles.ts      reads the raw `.mdx` off disk (node:fs) and builds the
 *                        rail's `href="#…"` from the same headings
 *
 * If these two ever disagreed, every wheel row on every article would scroll
 * nowhere. One function, imported twice, is the cheapest way to make that
 * impossible.
 *
 * The rules are the boring ones: lowercase, non-alphanumerics collapse to a
 * single dash, dashes trimmed off both ends. Typographic punctuation (the em
 * dashes and curly apostrophes this site's prose is full of) falls out with
 * everything else, so `Don't — really` and `Dont really` both land on
 * `don-t-really`; collisions inside one article are a content problem and would
 * be visible as two identical wheel rows.
 */
export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
