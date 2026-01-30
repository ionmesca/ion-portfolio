"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, ExternalLink, Sparkles } from "lucide-react";

// Design tokens - we'll iterate on these
const tokens = {
  colors: {
    // Backgrounds
    bg: {
      base: "#000000",
      surface: "#0a0a0a",
      elevated: "#141414",
      glass: "rgba(255, 255, 255, 0.03)",
    },
    // Text
    text: {
      primary: "#ffffff",
      secondary: "#a0a0a0",
      tertiary: "#666666",
      accent: "#ff9f6a", // Warm orange like Fey
    },
    // Borders
    border: {
      subtle: "rgba(255, 255, 255, 0.06)",
      default: "rgba(255, 255, 255, 0.1)",
      strong: "rgba(255, 255, 255, 0.2)",
    },
    // Interactive
    interactive: {
      primary: "#ffffff",
      primaryForeground: "#000000",
      secondary: "rgba(255, 255, 255, 0.1)",
      secondaryForeground: "#ffffff",
    },
  },
};

// Button Component Variants
function PlaygroundButton({
  variant = "primary",
  size = "default",
  children,
  className,
}: {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "glass";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  className?: string;
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 active:scale-95 active:duration-75";

  const variants = {
    primary:
      "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.1)]",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    outline:
      "border border-white/20 text-white hover:bg-white hover:text-black",
    glass:
      "bg-white/5 backdrop-blur-xl text-white border border-white/10 hover:bg-white/10 hover:border-white/20 shadow-lg shadow-black/20",
  };

  const sizes = {
    sm: "h-8 px-3 text-sm rounded-lg",
    default: "h-10 px-5 text-sm rounded-xl",
    lg: "h-12 px-6 text-base rounded-xl",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={{ transition: `all 150ms cubic-bezier(0.34, 1.56, 0.64, 1)` }}
    >
      {children}
    </button>
  );
}

// Pill Button (rounded-full variant)
function PillButton({
  variant = "primary",
  size = "default",
  children,
  className,
}: {
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  className?: string;
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 active:scale-95 active:duration-75";

  const variants = {
    primary:
      "bg-white text-black hover:bg-white/90 shadow-[0_0_24px_rgba(255,255,255,0.15)]",
    secondary:
      "bg-white/10 text-white hover:bg-white/15 border border-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    glass:
      "bg-white/5 backdrop-blur-xl text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
  };

  const sizes = {
    sm: "h-8 px-4 text-sm rounded-full",
    default: "h-10 px-6 text-sm rounded-full",
    lg: "h-12 px-8 text-base rounded-full",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={{ transition: `all 150ms cubic-bezier(0.34, 1.56, 0.64, 1)` }}
    >
      {children}
    </button>
  );
}

// Snappy spring easing
const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// Icon Button
function IconButton({
  variant = "ghost",
  size = "default",
  children,
  className,
}: {
  variant?: "primary" | "secondary" | "ghost" | "glass";
  size?: "sm" | "default" | "lg";
  children: React.ReactNode;
  className?: string;
}) {
  const baseStyles =
    "inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50 rounded-full active:scale-95 active:duration-75";

  const variants = {
    primary: "bg-white text-black hover:bg-white/90",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    ghost: "text-white/60 hover:text-white hover:bg-white/5",
    glass:
      "bg-white/5 backdrop-blur-xl text-white/80 hover:text-white border border-white/10 hover:bg-white/10",
  };

  const sizes = {
    sm: "size-8",
    default: "size-10",
    lg: "size-12",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      style={{ transition: `all 150ms ${EASE_SPRING}` }}
    >
      {children}
    </button>
  );
}

// Text Link with animated underline
function TextLink({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href="#"
      className={cn(
        "relative inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors duration-200",
        "after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out",
        "hover:after:origin-left hover:after:scale-x-100",
        className
      )}
    >
      {children}
    </a>
  );
}

// Card Component
function Card({
  variant = "default",
  children,
  className,
}: {
  variant?: "default" | "elevated" | "glass";
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    default: "bg-[#0a0a0a] border border-white/[0.06]",
    elevated:
      "bg-[#141414] border border-white/[0.08] shadow-xl shadow-black/50",
    glass:
      "bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-xl shadow-black/30",
  };

  return (
    <div className={cn("rounded-2xl p-6", variants[variant], className)}>
      {children}
    </div>
  );
}

// Badge Component
function Badge({
  variant = "default",
  children,
  className,
}: {
  variant?: "default" | "accent" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  const variants = {
    default: "bg-white/10 text-white/80",
    accent: "bg-[#ff9f6a]/20 text-[#ff9f6a]",
    success: "bg-emerald-500/20 text-emerald-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Input Component
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
        "h-10 w-full rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white placeholder:text-white/40",
        "focus:outline-none focus:border-white/20 focus:bg-white/[0.07] focus:ring-2 focus:ring-white/10",
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-white/[0.06] bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-white">
                Style Playground
              </h1>
              <p className="text-sm text-white/50">
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
                      : "text-white/60 hover:text-white hover:bg-white/5"
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
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-black border border-white/10" />
              <p className="text-xs text-white/60">
                Base <span className="text-white/40">#000000</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[#0a0a0a] border border-white/10" />
              <p className="text-xs text-white/60">
                Surface <span className="text-white/40">#0a0a0a</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[#141414] border border-white/10" />
              <p className="text-xs text-white/60">
                Elevated <span className="text-white/40">#141414</span>
              </p>
            </div>
            <div className="space-y-3">
              <div className="h-20 rounded-xl bg-[#ff9f6a]" />
              <p className="text-xs text-white/60">
                Accent <span className="text-white/40">#ff9f6a</span>
              </p>
            </div>
          </div>

          {/* Text hierarchy */}
          <div className="mt-8 space-y-4">
            <p className="text-white">Primary text - #ffffff</p>
            <p className="text-[#a0a0a0]">Secondary text - #a0a0a0</p>
            <p className="text-[#666666]">Tertiary text - #666666</p>
            <p className="text-[#ff9f6a]">Accent text - #ff9f6a</p>
          </div>
        </section>

        {/* Buttons Section */}
        {activeTab === "buttons" && (
          <section className="space-y-12">
            {/* Rectangular Buttons */}
            <div>
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                Rectangular Buttons
              </h2>
              <div className="flex flex-wrap gap-4">
                <PlaygroundButton variant="primary">
                  Primary
                  <ArrowRight className="size-4" />
                </PlaygroundButton>
                <PlaygroundButton variant="secondary">Secondary</PlaygroundButton>
                <PlaygroundButton variant="outline">Outline</PlaygroundButton>
                <PlaygroundButton variant="ghost">Ghost</PlaygroundButton>
                <PlaygroundButton variant="glass">
                  <Sparkles className="size-4" />
                  Glass Effect
                </PlaygroundButton>
              </div>
            </div>

            {/* Pill Buttons */}
            <div>
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
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
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
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
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
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
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                Text Links
              </h2>
              <div className="flex flex-wrap gap-6">
                <TextLink>
                  View case study
                  <ArrowRight className="size-4" />
                </TextLink>
                <TextLink>Read more</TextLink>
                <TextLink>
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
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                Card Variants
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card variant="default">
                  <Badge className="mb-3">Default</Badge>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Surface Card
                  </h3>
                  <p className="text-sm text-white/60">
                    Subtle background with thin border for content sections.
                  </p>
                </Card>

                <Card variant="elevated">
                  <Badge variant="accent" className="mb-3">
                    Elevated
                  </Badge>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Elevated Card
                  </h3>
                  <p className="text-sm text-white/60">
                    Stronger presence with shadow for focused content.
                  </p>
                </Card>

                <Card variant="glass">
                  <Badge variant="success" className="mb-3">
                    <Sparkles className="size-3" />
                    Glass
                  </Badge>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Glass Card
                  </h3>
                  <p className="text-sm text-white/60">
                    Frosted glass effect for floating elements.
                  </p>
                </Card>
              </div>
            </div>

            {/* Interactive Card */}
            <div>
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
                Interactive Card
              </h2>
              <div
                className={cn(
                  "group relative rounded-2xl p-6 cursor-pointer",
                  "bg-[#0a0a0a] border border-white/[0.06]",
                  "hover:border-white/[0.12] hover:bg-[#0f0f0f]",
                  "transition-all duration-300"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      Project Title
                    </h3>
                    <p className="text-sm text-white/60">
                      A brief description of the project and its impact.
                    </p>
                  </div>
                  <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ArrowRight className="size-5 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Inputs Section */}
        {activeTab === "inputs" && (
          <section className="space-y-12">
            <div>
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
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
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
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
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
            Typography (Aeonik Pro)
          </h2>
          <div className="space-y-6">
            <div>
              <p className="text-xs text-white/40 mb-2">Display / 48px / Light</p>
              <h1 className="text-5xl font-light tracking-tight text-white">
                Design Engineer
              </h1>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">
                Heading 1 / 36px / Semibold
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-white">
                Building AI-native products
              </h2>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">
                Heading 2 / 24px / Medium
              </p>
              <h3 className="text-2xl font-medium text-white">
                Selected work and experiments
              </h3>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">Body / 16px / Regular</p>
              <p className="text-base text-white/70 max-w-2xl">
                I craft interfaces that feel inevitable—where every interaction,
                transition, and detail serves a purpose. Currently focused on
                AI-powered tools that augment human creativity.
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-2">
                Caption / 14px / Regular
              </p>
              <p className="text-sm text-white/50">
                Last updated January 2026 · San Francisco, CA
              </p>
            </div>
          </div>
        </section>

        {/* Accent Usage */}
        <section>
          <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-6">
            Accent Usage
          </h2>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold text-white">
              Crafting interfaces,{" "}
              <span className="text-[#ff9f6a]">one pixel at a time.</span>
            </h3>
            <p className="text-white/60">
              The accent color draws attention to{" "}
              <span className="text-[#ff9f6a]">key moments</span> without
              overwhelming the minimal aesthetic.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
