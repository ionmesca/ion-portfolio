# AppShell Layout System Plan

> Build the navigation architecture for ion-portfolio: collapsible sidebar, contextual top bar, mobile bottom tabs.

---

## Overview

**Goal**: Implement the layout system from PRD Section 3 (Layout System) and Section 7.2 (Implementation Tasks).

**Current State**: Project setup complete. Routes scaffolded. All UI components installed. Sidebar color tokens already in `globals.css`.

**Deliverables**:
- Collapsible sidebar with nav items + theme toggle
- Contextual top bar with tabs + action slots
- Scrollable content area
- Mobile bottom tab bar
- LocalStorage persistence for collapse state (md+ only)

---

## Component Architecture

```
AppShell
├── SidebarProvider (context for collapse + mobile open state)
├── Sidebar (desktop) / Sheet (mobile)
│   ├── SidebarHeader (logo/brand + collapse toggle)
│   ├── SidebarContent (nav items in ScrollArea)
│   └── SidebarFooter (theme toggle + socials)
├── main (flex-1, min-h-0, overflow-hidden)
│   ├── TopBar (hamburger + breadcrumb + tabs + actions)
│   └── ContentArea (overflow-y-auto, page content)
└── BottomTabBar (mobile only, fixed, safe-area aware)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `lib/route-config.ts` | Route metadata (title, tabs, actions) |
| `components/layout/sidebar-provider.tsx` | Context for collapse + mobile open state |
| `components/layout/sidebar.tsx` | Desktop sidebar + MobileSidebar (Sheet) |
| `components/layout/top-bar.tsx` | Hamburger + breadcrumb + tabs + actions |
| `components/layout/content-area.tsx` | Scrollable content wrapper |
| `components/layout/bottom-tab-bar.tsx` | Mobile navigation (fixed bottom) |
| `components/layout/app-shell.tsx` | Root layout wrapper |

---

## Implementation Details

### 1. SidebarProvider (`sidebar-provider.tsx`)

```typescript
// Client component
// State:
//   - isCollapsed: boolean (desktop sidebar width toggle)
//   - isMobileOpen: boolean (Sheet open state)
//   - toggle(): toggle isCollapsed
//   - setMobileOpen(open: boolean): control Sheet
//
// localStorage behavior:
//   - Only persist isCollapsed for md+ breakpoints
//   - On mount: check window.innerWidth >= md (768px), then read localStorage
//   - On resize crossing md breakpoint: don't restore collapsed from storage
//   - Key: "sidebar-collapsed"
//
// SSR hydration:
//   - Default to expanded (false) during SSR
//   - Hydrate from localStorage after mount (useEffect)
```

### 2. Sidebar (`sidebar.tsx`)

**Specs from PRD**:
- Width: collapsed ~64px, expanded ~200px
- Default: expanded on desktop
- Toggle button in header (PanelLeftClose/PanelLeft icons)
- Items: icon + label (label hidden when collapsed)
- Active state: left border accent or bg highlight
- Bottom: theme toggle + social links (GitHub, LinkedIn, Twitter)

**Nav Items**:
| Label | Icon | Path | Match |
|-------|------|------|-------|
| Home | Home | / | exact |
| Work | Briefcase | /work | prefix (`/work/*`) |
| Stack | Layers | /stack | exact |
| Writing | PenLine | /writing | prefix (`/writing/*`) |
| Agent | Bot | /agent | exact |

**Active state logic**:
```typescript
const pathname = usePathname();
const isActive = item.match === "prefix"
  ? pathname.startsWith(item.path)
  : pathname === item.path;
```

**Mobile**: Use Sheet component (side="left") controlled by `isMobileOpen` from context.

### 3. TopBar (`top-bar.tsx`)

**Specs from PRD**:
- Height: ~48-56px
- Left: Mobile hamburger (calls `setMobileOpen(true)` from context) + page title
- Center: Tabs (when applicable)
- Right: Action buttons slot

**Route config approach** (avoid manual TopBar in each page):
```typescript
// lib/route-config.ts
export const routeConfig: Record<string, {
  title: string;
  tabs?: { id: string; label: string; href: string }[];
  actions?: React.ReactNode;
}> = {
  "/": { title: "Home" },
  "/work": { title: "Work" },
  "/work/[slug]": {
    title: "Case Study",
    tabs: [
      { id: "overview", label: "Overview", href: "?tab=overview" },
      { id: "process", label: "Process", href: "?tab=process" },
      { id: "results", label: "Results", href: "?tab=results" },
    ]
  },
  "/stack": { title: "Stack" },
  "/writing": { title: "Writing" },
  "/agent": { title: "Agent" },
};
```

TopBar reads `usePathname()` and looks up config. Pages don't need to render TopBar manually.

### 4. ContentArea (`content-area.tsx`)

- `overflow-y-auto` (NOT ScrollArea to avoid nested scroll traps)
- Max-width constraint (max-w-4xl centered)
- Consistent padding (p-6 md:p-8)
- Bottom padding when BottomTabBar visible: `pb-[calc(var(--bottom-tab-height,4rem)+env(safe-area-inset-bottom))]`
- Can be server component (just a wrapper div)

### 5. BottomTabBar (`bottom-tab-bar.tsx`)

**Specs from PRD**:
- Visible only below md breakpoint (`md:hidden`)
- Fixed to bottom (`fixed bottom-0 inset-x-0`)
- Safe area: `pb-[env(safe-area-inset-bottom)]`
- Height: ~64px (define as CSS var `--bottom-tab-height`)
- Items: Home, Work, Stack, Agent (4 primary)
- Active state: uses `usePathname()` with prefix matching

### 6. AppShell (`app-shell.tsx`)

Root wrapper that composes all layout components:
```typescript
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Desktop sidebar */}
        <Sidebar className="hidden md:flex" />
        {/* Mobile sidebar (Sheet) */}
        <MobileSidebar className="md:hidden" />

        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <TopBar />
          <ContentArea>{children}</ContentArea>
        </main>

        <BottomTabBar className="md:hidden" />
      </div>
    </SidebarProvider>
  );
}
```

Note: `min-h-0` on main prevents flex children from overflowing.

---

## Layout Integration

### Update `app/layout.tsx`

Wrap children with AppShell inside providers:

```typescript
<ThemeProvider>
  <ConvexClientProvider>
    <AppShell>
      {children}
    </AppShell>
  </ConvexClientProvider>
</ThemeProvider>
```

### Page Updates

Each page becomes just content (remove p-8 wrapper):
```typescript
// Before
export default function WorkPage() {
  return <div className="p-8">Work</div>;
}

// After
export default function WorkPage() {
  return <div>Work content here</div>;
}
```

---

## Responsive Behavior

| Breakpoint | Sidebar | TopBar | BottomTabBar |
|------------|---------|--------|--------------|
| Desktop (lg+) | Expanded by default | Full | Hidden |
| Tablet (md) | Collapsed (icons only) | Full | Hidden |
| Mobile (<md) | Hidden (Sheet overlay) | Simplified | Visible |

---

## Existing Resources

Already available:
- `components/ui/sheet.tsx` - Mobile sidebar overlay
- `components/ui/tabs.tsx` - Top bar tabs
- `components/ui/scroll-area.tsx` - Content scrolling
- `components/ui/separator.tsx` - Visual dividers
- `components/ui/button.tsx` - Nav items, toggles
- `components/ui/tooltip.tsx` - Icon-only labels
- `components/theme-toggle.tsx` - Theme switcher
- `lib/utils.ts` - `cn()` utility
- Sidebar colors in `globals.css` - `--sidebar-*` tokens

---

## Verification

1. **Navigation works**: Click each sidebar item, verify routing
2. **Collapse toggle**: Click toggle, verify sidebar collapses/expands
3. **Persistence**: Refresh page, verify collapse state persists
4. **Mobile**: Resize to mobile, verify bottom tabs appear, sidebar becomes Sheet
5. **Theme toggle**: Click theme toggle in sidebar, verify dark/light switch
6. **Active states**: Navigate to each page, verify active nav item highlighted
7. **Keyboard**: Tab through nav items, verify focus states

---

## Execution Order

**Step 0: Create Claude Code tasks** to track progress through implementation.

**Implementation:**
1. Create `lib/route-config.ts` (route metadata)
2. Create `sidebar-provider.tsx` (context + localStorage)
3. Create `sidebar.tsx` (desktop + mobile Sheet)
4. Create `top-bar.tsx` (hamburger + breadcrumb + tabs)
5. Create `content-area.tsx` (scroll wrapper + safe-area padding)
6. Create `bottom-tab-bar.tsx` (mobile nav)
7. Create `app-shell.tsx` (compose all)
8. Update `app/layout.tsx` (integrate AppShell)
9. Update page components (remove padding wrappers)
10. Test all breakpoints + verify navigation

**Tasks to create**:
- Create route config
- Create SidebarProvider context
- Create Sidebar component (desktop + mobile)
- Create TopBar component
- Create ContentArea component
- Create BottomTabBar component
- Create AppShell wrapper
- Integrate AppShell into layout
- Update page components
- Test and verify
