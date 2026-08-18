/* ============================================================================
   DEV-ONLY SPECIMEN ROUTE — DELETE BEFORE CUTOVER.

   This page exists so the foundation primitives can be reviewed and screenshot
   in one place. It is not part of the site, it is not linked from anywhere, and
   it must be removed before the rebuild goes live.

   Add `?theme=dark` to render the whole page inside a forced `.dark` wrapper.
   ========================================================================== */

import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ArrowUpRight, Copy, Plus, Search } from "@/lib/icons";

export const metadata = { robots: { index: false, follow: false } };

/* -- type scale ------------------------------------------------------------ */

const TYPE_STEPS = [
  { cls: "text-xs", name: "text-xs", note: "12 / 140% / Regular · Caption" },
  { cls: "text-small", name: "text-small", note: "13 / 145% / Regular · Small" },
  { cls: "text-sm", name: "text-sm", note: "14 / 150% / Regular · Body" },
  {
    cls: "text-subhead",
    name: "text-subhead",
    note: "15 / 135% / Medium · Subhead",
  },
  { cls: "text-base", name: "text-base", note: "16 / 170% / Regular · Prose" },
  { cls: "text-lg", name: "text-lg", note: "18 / 130% / Medium / −1% · Heading" },
  { cls: "text-2xl", name: "text-2xl", note: "24 / 125% / Medium / −1% · Title" },
] as const;

/* -- elevation ------------------------------------------------------------- */

const ELEVATION_STEPS = [
  { cls: "shadow-subtle", name: "subtle", note: "size 4 · 4%" },
  { cls: "shadow-raised", name: "raised", note: "size 8 · 4%" },
  { cls: "shadow-overlay", name: "overlay", note: "size 16 · 5%" },
  { cls: "shadow-modal", name: "modal", note: "size 32 · 6%" },
] as const;

/* -- helpers --------------------------------------------------------------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-xs text-muted-foreground">{children}</span>;
}

function Swatch({ cls, name }: { cls: string; name: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-12 w-24 rounded-md border border-border ${cls}`} />
      <Label>{name}</Label>
    </div>
  );
}

function ColorStrip() {
  return (
    <div className="flex gap-4 rounded-lg bg-background p-4">
      <Swatch cls="bg-background" name="background" />
      <Swatch cls="bg-card" name="card" />
      <Swatch cls="bg-muted" name="muted" />
      <Swatch cls="bg-border" name="border" />
      <Swatch cls="bg-primary" name="primary" />
      <Swatch cls="bg-secondary" name="secondary" />
    </div>
  );
}

/* -- button matrix --------------------------------------------------------- */

const VARIANTS = ["primary", "secondary", "ghost"] as const;

// Hover cannot be captured in a screenshot, so each variant gets a third cell
// with the hover fill applied as a static class. Same token as the `hover:`
// rule inside the component.
const FORCED_HOVER: Record<(typeof VARIANTS)[number], string> = {
  primary: "bg-primary-hover",
  secondary: "bg-muted",
  ghost: "bg-ghost-hover",
};

function ButtonRow({
  variant,
  size,
}: {
  variant: (typeof VARIANTS)[number];
  size: "default" | "touch";
}) {
  return (
    <div className="flex items-center gap-6">
      <span className="w-36 shrink-0 text-xs text-muted-foreground">
        {variant} · {size === "default" ? "32px" : "40px touch"}
      </span>
      <Button variant={variant} size={size}>
        Book a call
      </Button>
      <Button variant={variant} size={size} className={FORCED_HOVER[variant]}>
        Book a call
      </Button>
      <Button variant={variant} size={size} disabled>
        Book a call
      </Button>
      <Button variant={variant} size={size}>
        <Plus />
        Book a call
        <ArrowUpRight />
      </Button>
      <Button
        variant={variant}
        size={size === "default" ? "icon" : "icon-touch"}
        aria-label="Search"
      >
        <Search />
      </Button>
      <Button
        variant={variant}
        size={size === "default" ? "icon" : "icon-touch"}
        aria-label="Copy email"
      >
        <Copy />
      </Button>
    </div>
  );
}

/* -- page ------------------------------------------------------------------ */

export default async function DevSpecimenPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string }>;
}) {
  // Belt and braces against the "delete before cutover" note being missed: the
  // specimen never renders in a production build, only in `bun dev`.
  if (process.env.NODE_ENV === "production") notFound();

  const { theme } = await searchParams;
  const dark = theme === "dark";

  return (
    <div className={dark ? "dark" : undefined}>
      <main className="min-h-screen bg-background px-10 py-10 text-foreground">
        <div className="flex max-w-[1400px] flex-col gap-12">
          <header className="flex flex-col gap-1">
            <h1 className="text-2xl">Foundation specimen</h1>
            <p className="text-sm text-muted-foreground">
              Dev-only review surface — deleted before cutover.{" "}
              {dark ? "Forced dark." : "Light. Add ?theme=dark for the dark pass."}
            </p>
          </header>

          {/* ---------------- type scale ---------------- */}
          <Section title="Type scale">
            <div className="flex flex-col gap-3">
              {TYPE_STEPS.map((step) => (
                <div key={step.name} className="flex items-baseline gap-6">
                  <span className="w-36 shrink-0 text-xs text-muted-foreground">
                    {step.name}
                  </span>
                  <span className={step.cls}>
                    Design engineer building interfaces
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                    {step.note}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* ---------------- buttons ---------------- */}
          <Section title="Buttons">
            <div className="flex gap-6 pl-36">
              <span className="w-[110px] text-xs text-muted-foreground">
                idle
              </span>
              <span className="w-[110px] text-xs text-muted-foreground">
                hover (forced)
              </span>
              <span className="w-[110px] text-xs text-muted-foreground">
                disabled
              </span>
              <span className="text-xs text-muted-foreground">
                icon + label + icon, then icon-only
              </span>
            </div>
            <div className="flex flex-col gap-4">
              {VARIANTS.map((variant) => (
                <ButtonRow key={variant} variant={variant} size="default" />
              ))}
              {VARIANTS.map((variant) => (
                <ButtonRow
                  key={`${variant}-touch`}
                  variant={variant}
                  size="touch"
                />
              ))}
            </div>
          </Section>

          {/* ---------------- keycaps ---------------- */}
          <Section title="Keycaps">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Label>escape</Label>
                <Kbd>esc</Kbd>
              </div>
              <div className="flex items-center gap-2">
                <Label>open palette</Label>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center gap-2">
                <Label>copy email</Label>
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>⇧</Kbd>
                  <Kbd>C</Kbd>
                </KbdGroup>
              </div>
              <div className="flex items-center gap-2">
                <Label>inline</Label>
                <span className="text-sm text-muted-foreground">
                  Press <Kbd>⌘</Kbd> <Kbd>K</Kbd> to open the palette.
                </span>
              </div>
            </div>
          </Section>

          {/* ---------------- elevation ---------------- */}
          <Section title="Elevation">
            <div className="flex gap-8 rounded-lg bg-muted p-8">
              {ELEVATION_STEPS.map((step) => (
                <div key={step.name} className="flex flex-col gap-2">
                  <div
                    className={`h-24 w-40 rounded-lg bg-card ${step.cls}`}
                  />
                  <Label>
                    {step.name} · {step.note}
                  </Label>
                </div>
              ))}
            </div>
          </Section>

          {/* ---------------- colour ---------------- */}
          <Section title="Colour">
            <div className="flex flex-col gap-4">
              <Label>light</Label>
              <ColorStrip />
              <Label>dark (.dark wrapper)</Label>
              <div className="dark">
                <ColorStrip />
              </div>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}
