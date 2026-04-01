"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ExternalLink, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PillButton } from "@/components/ui/pill-button";
import { IconButton } from "@/components/ui/icon-button";
import { TextLink } from "@/components/ui/text-link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Input({
  placeholder,
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={cn(
        "h-10 w-full rounded-xl bg-white/5 border border-[var(--color-border-default)] px-4 text-sm text-white placeholder:text-[var(--color-text-muted)]",
        "focus:outline-none focus:border-[var(--color-border-strong)] focus:bg-white/[0.07] focus:ring-2 focus:ring-white/10",
        "transition-all duration-200",
        className
      )}
    />
  );
}

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"buttons" | "cards" | "inputs">(
    "buttons"
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)]">
      {/* Header */}
      <div className="border-b border-[var(--color-border-subtle)] bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
                Style Playground
              </h1>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                Iterate on primitives and design tokens
              </p>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-white/5">
              {(["buttons", "cards", "inputs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    activeTab === tab
                      ? "bg-white text-black"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        {/* Color Palette */}
        <section>
          <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[var(--color-bg-base)] border border-[var(--color-border-default)]" />
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Base <span className="text-[var(--color-text-muted)]">#000000</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]" />
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Surface <span className="text-[var(--color-text-muted)]">#0a0a0a</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]" />
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Elevated <span className="text-[var(--color-text-muted)]">#141414</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-accent" />
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Accent <span className="text-[var(--color-text-muted)]">#ff9f6a</span>
              </p>
            </div>
          </div>

          {/* Text hierarchy */}
          <div className="mt-8 space-y-4">
            <p className="text-[var(--color-text-primary)]">Primary text - #ffffff</p>
            <p className="text-[var(--color-text-secondary)]">Secondary text - #a0a0a0</p>
            <p className="text-[var(--color-text-tertiary)]">Tertiary text - #666666</p>
            <p className="text-accent">Accent text - #ff9f6a</p>
          </div>
        </section>

        {/* Buttons Section */}
        {activeTab === "buttons" && (
          <section className="space-y-12">
            {/* Rectangular Buttons */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Rectangular Buttons
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="default" data-testid="rect-button-primary">
                  Primary
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="secondary" data-testid="rect-button-secondary">
                  Secondary
                </Button>
                <Button variant="outline" data-testid="rect-button-outline">
                  Outline
                </Button>
                <Button variant="ghost" data-testid="rect-button-ghost">
                  Ghost
                </Button>
                <Button variant="glass" data-testid="rect-button-glass">
                  <Sparkles className="size-4" />
                  Glass Effect
                </Button>
              </div>
            </div>

            {/* Pill Buttons */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Pill Buttons
              </h2>
              <div className="flex flex-wrap gap-4">
                <PillButton variant="primary">Get Started</PillButton>
                <PillButton variant="secondary">Learn More</PillButton>
                <PillButton variant="glass">
                  <Sparkles className="size-4" />
                  Try for Free
                </PillButton>
              </div>
            </div>

            {/* Button Sizes */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Sizes
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <PillButton variant="primary" size="sm">
                  Small
                </PillButton>
                <PillButton variant="primary" size="default">
                  Default
                </PillButton>
                <PillButton variant="primary" size="lg">
                  Large
                </PillButton>
              </div>
            </div>

            {/* Icon Buttons */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Icon Buttons
              </h2>
              <div className="flex flex-wrap gap-3">
                <IconButton variant="primary">
                  <ArrowRight className="size-5" />
                </IconButton>
                <IconButton variant="secondary">
                  <Check className="size-5" />
                </IconButton>
                <IconButton variant="ghost">
                  <ExternalLink className="size-5" />
                </IconButton>
                <IconButton variant="glass">
                  <Sparkles className="size-5" />
                </IconButton>
              </div>
            </div>

            {/* Text Links */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Text Links
              </h2>
              <div className="flex flex-wrap gap-6">
                <TextLink href="#">
                  View case study
                  <ArrowRight className="size-4" />
                </TextLink>
                <TextLink href="#">Read more</TextLink>
                <TextLink href="#">
                  <ExternalLink className="size-4" />
                  External link
                </TextLink>
              </div>
            </div>
          </section>
        )}

        {/* Cards Section */}
        {activeTab === "cards" && (
          <section className="space-y-12">
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Card Variants
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="default">
                  <CardContent>
                    <Badge className="mb-3">Default</Badge>
                    <h3 className="typo-h3 text-[var(--color-text-primary)] mb-2">
                      Surface Card
                    </h3>
                    <p className="typo-body-sm text-[var(--color-text-tertiary)]">
                      Subtle background with thin border for content sections.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="elevated">
                  <CardContent>
                    <Badge variant="accent" className="mb-3">
                      Elevated
                    </Badge>
                    <h3 className="typo-h3 text-[var(--color-text-primary)] mb-2">
                      Elevated Card
                    </h3>
                    <p className="typo-body-sm text-[var(--color-text-tertiary)]">
                      Stronger presence with shadow for focused content.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardContent>
                    <Badge variant="success" className="mb-3">
                      <Sparkles className="size-3" />
                      Glass
                    </Badge>
                    <h3 className="typo-h3 text-[var(--color-text-primary)] mb-2">
                      Glass Card
                    </h3>
                    <p className="typo-body-sm text-[var(--color-text-tertiary)]">
                      Frosted glass effect for floating elements.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Interactive Card */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Interactive Card
              </h2>
              <Card variant="interactive">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="typo-h3 text-[var(--color-text-primary)] mb-1">
                        Project Title
                      </h3>
                      <p className="typo-body-sm text-[var(--color-text-tertiary)]">
                        A brief description of the project and its impact.
                      </p>
                    </div>
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <ArrowRight className="size-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Inputs Section */}
        {activeTab === "inputs" && (
          <section className="space-y-12">
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Text Inputs
              </h2>
              <div className="max-w-md space-y-4">
                <Input placeholder="Default input..." />
                <div className="flex gap-3">
                  <Input placeholder="With button..." />
                  <PillButton variant="primary">Send</PillButton>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
                Badges
              </h2>
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="accent">
                  <Sparkles className="size-3" />
                  Featured
                </Badge>
                <Badge variant="success">
                  <Check className="size-3" />
                  Complete
                </Badge>
              </div>
            </div>
          </section>
        )}

        {/* Typography */}
        <section>
          <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
            Typography (Aeonik Pro)
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Display / 48px / Light</p>
              <h1 className="typo-display text-[var(--color-text-primary)]">
                Design Engineer
              </h1>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Heading 1 / 36px / Semibold
              </p>
              <h2 className="typo-h1 text-[var(--color-text-primary)]">
                Building AI-native products
              </h2>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Heading 2 / 24px / Medium
              </p>
              <h3 className="typo-h2 text-[var(--color-text-primary)]">
                Selected work and experiments
              </h3>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">Body / 16px / Regular</p>
              <p className="typo-body text-[var(--color-text-secondary)] max-w-2xl">
                I craft interfaces that feel inevitable—where every interaction,
                transition, and detail serves a purpose. Currently focused on
                AI-powered tools that augment human creativity.
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-2">
                Caption / 14px / Regular
              </p>
              <p className="typo-body-sm text-[var(--color-text-tertiary)]">
                Last updated January 2026 · San Francisco, CA
              </p>
            </div>
          </div>
        </section>

        {/* Accent Usage */}
        <section>
          <h2 className="typo-label text-[var(--color-text-tertiary)] mb-6">
            Accent Usage
          </h2>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-[var(--color-text-primary)]">
              Crafting interfaces,{" "}
              <span className="text-accent">one pixel at a time.</span>
            </h3>
            <p className="text-[var(--color-text-tertiary)]">
              The accent color draws attention to{" "}
              <span className="text-accent">key moments</span> without
              overwhelming the minimal aesthetic.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
