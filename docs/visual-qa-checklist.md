# Visual QA Checklist

A fast pass to keep the system premium, restrained, and consistent.

---

## Quick Pass (60 seconds)

- [ ] One accent per viewport (CTA or key term only)
- [ ] No stacked effects (glow + glass + heavy shadow)
- [ ] Only one headline style on screen
- [ ] Body text stays neutral (no colored paragraphs)
- [ ] One motion pattern per section (either reveal or stagger)
- [ ] Imagery consistency (diagram OR photo, not both)

---

## Detail Pass (5 minutes)

### Color
- [ ] Accent used for meaning (state, CTA, emphasis)
- [ ] Only one accent hue per section
- [ ] Borders are subtle; no high-contrast framing on content cards

### Depth
- [ ] Max two shadow levels per screen
- [ ] Glass only used on floating UI (dock, tooltip, modal)
- [ ] Glow only on primary CTA or hero visual

### Type
- [ ] Display type not competing with H1 in same viewport
- [ ] Uppercase labels are minimal and consistent
- [ ] Captions and metadata stay muted

### Motion
- [ ] Motion reinforces hierarchy or state change
- [ ] No continuous motion or parallax by default
- [ ] Reduced motion handled (no essential info hidden)

### Layout
- [ ] Spacing follows token scale (no arbitrary gaps)
- [ ] Section rhythm feels consistent across page
- [ ] Content density matches intent (scan vs read)

---

## Decision Tree (Effect Use)

1. Does the effect communicate meaning?
   - No -> Remove it.
   - Yes -> Continue.

2. Is there already a strong effect in this viewport?
   - Yes -> Remove or downgrade this effect.
   - No -> Continue.

3. Is this effect consistent with the system rules?
   - No -> Replace with a simpler alternative.
   - Yes -> Keep it.

---

## Defaults When Unsure

- Use border + subtle shadow, no glow.
- Use monochrome; add accent only to CTA.
- Use a single reveal animation, no stagger.
- Prefer smaller, schematic visuals over large imagery.

