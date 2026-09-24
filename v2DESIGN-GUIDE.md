# HCMUTE Website Frontend — Design System Guide for AI Agents

**Purpose**: This guide defines the visual design system and CSS patterns for the HCMUTE website. Follow these rules to maintain design consistency across all generated components.

**Target Audience**: AI agents (Copilot, Claude) generating new components, pages, and sections.

---

## 1. Color System (OKLCH)

The entire color palette uses **OKLCH color space** (perceptually uniform, modern CSS standard). All colors are defined as CSS variables in `:root` and `.dark` scopes.

### 1.1 Primary Color Palette

| Variable | Light | Dark | Purpose |
|----------|-------|------|---------|
| `--primary` | oklch(0.5505 0.2485 262.5896) | oklch(0.6357 0.1959 260.1213) | Links, CTAs, primary buttons |
| `--primary-foreground` | oklch(0.9801 0.0096 252.8096) | oklch(100% 0.00011 271.152) | Text on primary buttons |
| `--secondary` | oklch(0.9404 0.0197 245.6429) | oklch(0.2792 0.0512 251.0746) | Secondary actions, accents |
| `--secondary-foreground` | oklch(0.2993 0.0609 251.2891) | oklch(0.8989 0.0203 250.3975) | Text on secondary |
| `--accent` | oklch(0.97 0.014 254.604) | oklch(0.4007 0.1195 259.9299) | Highlights, badges |
| `--accent-foreground` | oklch(0.421 0.1203 261.7139) | oklch(0.9594 0.02 250.3828) | Text on accent |
| `--destructive` | oklch(0.6207 0.2306 24.9164) | oklch(0.6188 0.2376 25.7658) | Danger, errors, deletions |
| `--destructive-foreground` | oklch(0.9801 0.0096 252.8096) | oklch(1 0 0) | Text on destructive |

### 1.2 Neutral Color Palette

| Variable | Light | Dark | Usage |
|----------|-------|------|-------|
| `--background` | oklch(100% 0.00011 271.152) | oklch(0.1621 0.0472 251.0579) | Full-page background |
| `--foreground` | rgb(0, 71, 118) | oklch(0.9411 0.019 248.0297) | Primary text |
| `--muted` | oklch(0.9205 0.0146 244.7261) | oklch(0.2386 0.0395 251.1373) | Muted backgrounds, disabled |
| `--muted-foreground` | oklch(38.082% 0.08041 252.8) | oklch(0.7211 0.0295 248.2358) | Secondary text, hints |
| `--card` | oklch(1 0 0) | oklch(0.2011 0.0502 250.7748) | Card/panel backgrounds |
| `--card-foreground` | oklch(0.2602 0.0703 254.8723) | oklch(0.9411 0.019 248.0297) | Card text |
| `--border` | oklch(0.93 0.03 264) | oklch(0.2991 0.0399 250.6425) | Borders, dividers, rules |
| `--input` | oklch(91.513% 0.00323 15.446) | oklch(0.2707 0.0499 250.1517) | Form input backgrounds |
| `--ring` | oklch(0.632 0.1979 260.8448) | oklch(0.6633 0.1802 257.7933) | Focus outlines |

### 1.3 Semantic Color Chart

| Variable | Light | Dark | Purpose |
|----------|-------|------|---------|
| `--chart-1` | oklch(0.6723 0.1606 244.9955) | oklch(0.6723 0.1606 244.9955) | Data visualization series 1 |
| `--chart-2` | oklch(0.6907 0.1554 160.3454) | oklch(0.6907 0.1554 160.3454) | Data visualization series 2 |
| `--chart-3` | oklch(0.8214 0.16 82.5337) | oklch(0.8214 0.16 82.5337) | Data visualization series 3 |
| `--chart-4` | oklch(0.7064 0.1822 151.7125) | oklch(0.7064 0.1822 151.7125) | Data visualization series 4 |
| `--chart-5` | oklch(0.5919 0.2186 10.5826) | oklch(0.5919 0.2186 10.5826) | Data visualization series 5 |

### 1.4 Named Color Stops (Gradient Reference)

```css
--color-1: oklch(66.2% 0.225 25.9);    /* Orange-red (accent) */
--color-2: oklch(60.4% 0.26 302);      /* Purple (secondary) */
--color-3: oklch(69.6% 0.165 251);     /* Blue-purple (primary) */
--color-4: oklch(80.2% 0.134 225);     /* Light blue (tertiary) */
--color-5: oklch(90.7% 0.231 133);     /* Yellow-green (highlight) */

--gradient-primary: oklch(0.81 0.1399 220.07);      /* Light blue gradient stop */
--gradient-secondary: oklch(0.4912 0.2867 268.64);  /* Deep purple gradient stop */
```

### 1.5 How to Use Colors in New Components

#### ✅ Correct Pattern: Use CSS Variables

```tsx
// ✓ Use --primary for links and primary actions
<a className="text-primary hover:text-primary/80">Learn More</a>

// ✓ Use --foreground for body text
<p className="text-foreground">Description text</p>

// ✓ Use --muted for secondary text
<span className="text-muted-foreground">Subtitle or helper text</span>

// ✓ Use --border for dividers
<div className="border border-border"></div>
```

#### ❌ Incorrect Pattern: Hard-coded Colors

```tsx
// ✗ Never use hex/rgb hard-coded colors
<a className="text-blue-500">Don't do this</a>
<p className="text-gray-700">Wrong approach</p>

// ✗ Avoid arbitrary Tailwind colors not in design system
<button className="bg-indigo-600">Wrong</button>
```

---

## 2. Typography

### 2.1 Font Stack

```css
--font-sans: Inter, ui-sans-serif, sans-serif, system-ui;      /* Body, UI */
--font-serif: Georgia, serif;                                   /* Editorial */
--font-mono: JetBrains Mono, ui-monospace, monospace;           /* Code */
```

**Usage Rules**:
- **Body & UI**: Use `font-sans` (default, inherited)
- **Headlines**: Use `font-sans` with weight `600` or `700` (bold)
- **Code blocks**: Use `font-mono` with `text-xs` or `text-sm`
- **Emphasis**: Use `font-serif` only for editorial/blog content

### 2.2 Font Weight Conventions

| Weight | CSS Class | Usage |
|--------|-----------|-------|
| 400 (Regular) | `font-normal` | Body copy, default |
| 500 (Medium) | `font-medium` | Secondary UI labels |
| 600 (SemiBold) | `font-semibold` | Subheadings, emphasis |
| 700 (Bold) | `font-bold` | Headlines, important text |
| 900 (Black) | `font-black` | Hero headlines, brand |

### 2.3 Heading Scale

```
h1: 2em     (2.0rem × 16px = 32px)  | font-weight: 700 | line-height: 1.3
h2: 1.5em   (1.5rem × 16px = 24px)  | font-weight: 600 | line-height: 1.4
h3: 1.25em  (1.25rem × 16px = 20px) | font-weight: 600 | line-height: 1.4
h4: 1em     (1rem × 16px = 16px)    | font-weight: 600 | line-height: 1.5
h5: 0.9em   (0.9rem × 16px ≈ 14px)  | font-weight: 600 | line-height: 1.5
h6: 0.85em  (0.85rem × 16px ≈ 14px) | font-weight: 600 | line-height: 1.6
```

### 2.4 Body Text & Line Heights

```
Body:            16px (1rem) | line-height: 1.6 | font-weight: 400
Small/caption:   14px        | line-height: 1.5 | font-weight: 400
Helper/muted:    12px        | line-height: 1.5 | font-weight: 500
Overline/label:  12px        | line-height: 1.2 | font-weight: 600 (uppercase)
```

#### Fix for Vietnamese Diacritics Clipping

All text inputs automatically have `line-height: 2.05` to prevent diacritics from clipping:

```css
/* Applied globally to all inputs */
input, textarea, select {
  line-height: 2.05 !important;
  overflow: visible !important;
}
```

---

## 3. Spacing & Layout System

### 3.1 Site Layout Constants

```css
--site-width: 80rem;          /* 1280px — max content width */
--site-px: 1.25rem;           /* 20px — mobile horizontal padding */
--site-px-lg: 1.5rem;         /* 24px — desktop horizontal padding */

--topbar-h: 48px;             /* Navigation bar height */
--header-h: 72px;             /* Sticky white header height */
```

### 3.2 Spacing Scale (Tailwind 4)

```
px (1px), 0.5, 1 (4px), 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12,
14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 80, 96, 112, 128
```

### 3.3 Responsive Breakpoints

```
sm:   640px
md:   768px
lg:   1024px
xl:   1280px
2xl:  1536px
```

### 3.4 Container Width Patterns

#### Full Bleed (100vw — no side padding)
```tsx
<div className="w-screen">
  {/* Bleed to edges of viewport */}
</div>
```

#### Standard Container (max --site-width, centered)
```tsx
<div className="mx-auto w-full max-w-[80rem] px-[var(--site-px)] md:px-[var(--site-px-lg)]">
  {/* Centered content with responsive padding */}
</div>
```

#### Full Width with Side Padding
```tsx
<div className="w-full px-[var(--site-px)] md:px-[var(--site-px-lg)]">
  {/* Content stretches to viewport edges with padding */}
</div>
```

---

## 4. Border Patterns

### 4.1 Standard Borders

```tsx
// Single-color border (light theme)
<div className="border border-border">Content</div>

// Thick border (emphasis)
<div className="border-2 border-border">Content</div>

// Bottom border only (divider)
<div className="border-b border-border">Content</div>

// Top border only (section separator)
<div className="border-t border-border">Content</div>
```

### 4.2 Vertical Side Borders (Fixed Position)

The site uses **fixed vertical borders** at the left and right edges of the `--site-width` (1280px center column). These borders are always visible at full viewport height.

#### Page Side Borders (Light Background): `.page-border-x`

Applied to the **public layout wrapper**. Creates 1px borders at the calculated left/right boundaries:

```tsx
// Public layout
<div className="page-border-x">
  {/* Fixed vertical borders always visible */}
</div>
```

**Behavior**:
- Borders render at `calc((100vw - var(--site-width)) / 2)` from viewport edges
- On small screens, borders move inward and may be invisible
- On large screens, borders frame the 1280px center column
- Applied via `::before` and `::after` pseudo-elements with `position: fixed`

#### Colored Section Borders (Dark Backgrounds): `.page-border-x-light`

Used on **dark-background sections** (footer, leadership). Overlays white-tinted borders:

```tsx
// Dark section with light borders
<section className="page-border-x-light bg-slate-900">
  {/* White borders (rgba opacity 0.15) overlay the fixed borders */}
</section>
```

#### Light Section Borders (When Covering Fixed Borders): `.page-border-x-dark`

Used on **sticky/elevated elements** (header, nav) that cover the fixed borders. Uses `--border` color:

```tsx
// Sticky header that covers fixed borders
<header className="page-border-x-dark sticky top-0 z-20 bg-white">
  {/* Solid borders match the main site borders */}
</header>
```

---

## 5. Card & Panel Styles

### 5.1 Basic Card

```tsx
<div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
  <h3 className="font-semibold">Card Title</h3>
  <p className="text-muted-foreground">Card content here.</p>
</div>
```

### 5.2 Card with Hover Elevation

```tsx
<div className="rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md">
  {/* Content immediately becomes elevated on hover */}
</div>
```

### 5.3 Colored Card Variants

**Primary Card** (blue-tinted):
```tsx
<div className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-foreground">
  {/* Primary-themed card */}
</div>
```

**Accent Card** (highlight):
```tsx
<div className="rounded-lg border border-accent/30 bg-accent/10 p-6 text-foreground">
  {/* Accent-themed card, subtle background */}
</div>
```

**Muted/Disabled Card**:
```tsx
<div className="rounded-lg border border-muted bg-muted p-6 text-muted-foreground opacity-60">
  {/* Disabled or secondary card */}
</div>
```

---

## 6. Shadow System

### 6.1 Available Shadows

```css
--shadow-2xs: 0px 2px 0px 0px hsl(.../ 0)         /* Minimal */
--shadow-xs:  0px 2px 0px 0px hsl(.../ 0)         /* Very subtle */
--shadow-sm:  0px 2px 0px, 1px 2px -1px ...       /* Default, small elevations */
--shadow:     0px 2px 0px, 1px 2px -1px ...       /* Standard shadow */
--shadow-md:  0px 2px 0px, 2px 4px -1px ...       /* Medium elevation */
--shadow-lg:  0px 2px 0px, 4px 6px -1px ...       /* Large elevation */
--shadow-xl:  0px 2px 0px, 8px 10px -1px ...      /* Extra large */
--shadow-2xl: 0px 2px 0px 0px ...                 /* Maximum */

--shadow-badge: 0 0 0 1px var(--foreground / 0.08),  /* Badge glow */
                0 1px 2px -0.5px var(--foreground / 0.12),
                0 2px 4px -2px var(--foreground / 0.1)
```

### 6.2 Shadow Usage

```tsx
// Subtle card elevation
<div className="shadow-sm">Subtle shadow</div>

// Default elevation
<div className="shadow">Default shadow</div>

// Medium elevation (hover state)
<div className="shadow-md hover:shadow-lg">Hover lifts it</div>

// Badge with small glow
<span className="rounded-full px-3 py-1" style={{ boxShadow: 'var(--shadow-badge)' }}>
  Badge
</span>
```

---

## 7. Hero Carousel & Image Sizing

### 7.1 Safe-Area Contracts

The hero carousel uses images with specific **safe-area contracts** to guarantee no cropping on any device.

#### Desktop Hero (2.4:1 landscape)

```
Canvas:        2400 × 1000 px
Container:     aspect-ratio: 2.4 / 1 (locks ratio on all devices)
Content band:  2100 × 620 px (center area, never cropped)
Safe margin:   150px left/right, 190px top/bottom
Text block:    1200 × 460 px (safe inner area for headlines)
```

**CSS** (in `globals.css`):
```css
.hero-carousel-height {
  width: 100%;
  aspect-ratio: 3 / 4;  /* Mobile */
  height: auto;
}

@media (min-width: 768px) {
  .hero-carousel-height {
    aspect-ratio: 2.4 / 1;  /* Desktop */
  }
}
```

#### Mobile Hero (5:6 portrait)

```
Canvas:        1000 × 1200 px
Container:     aspect-ratio: 5 / 6 (locks on mobile, <768px)
Content band:  860 × 520 px
Safe margin:   70px left/right, 340px top/bottom
Text block:    600 × 320 px
```

### 7.2 Safe-Area Design Rules

When creating hero carousel images:

1. **Always use the contract dimensions**: 2400×1000 for desktop, 1000×1200 for mobile
2. **Content must fit in the content band**: 2100×620 (desktop) or 860×520 (mobile)
3. **Never place critical UI outside the safe area**: Logos, headlines, CTAs must use the text block
4. **Bleed is allowed**: Decorative elements (gradients, graphics) can extend beyond the safe area
5. **Aspect ratio is locked**: Container will never crop the image on any device size

---

## 8. Animations & Motion

### 8.1 Predefined Animations

```css
--animate-shine:                shine 3s ease-out infinite
--animate-gradient-flow:        gradientFlow 10s ease 0s infinite
--animate-btn-shimmer:          btn-shimmer 0.6s ease-in-out
--animate-line-shadow:          line-shadow 15s linear infinite
--animate-aurora:               aurora 8s ease-in-out infinite alternate
--animate-marquee:              marquee var(--duration) infinite linear
--animate-marquee-vertical:     marquee-vertical var(--duration) linear infinite
--animate-shimmer-slide:        shimmer-slide var(--speed) ease-in-out infinite alternate
--animate-spin-around:          spin-around calc(var(--speed) * 2) infinite linear
--animate-shiny-text:           shiny-text 8s infinite
--animate-blink-cursor:         blink-cursor 1.2s step-end infinite
--animate-rainbow:              rainbow var(--speed, 2s) infinite linear
--animate-dash-flow:            dash-flow 0.5s linear infinite
--animate-cta-shimmer:          cta-shimmer (custom)
```

### 8.2 Framer Motion Usage

Import from `motion/react` (NOT `framer-motion`):

```tsx
import { motion } from "motion/react";

// Simple fade-in
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
  Content
</motion.div>

// Slide-up on scroll
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
  viewport={{ once: true }}
>
  Content slides up when visible
</motion.div>
```

### 8.3 Transition Timing

```css
Fast:       150-200ms (ui, hovers)
Standard:   300-400ms (opens, state changes)
Slow:       500-600ms (page transitions)
Very slow:  800-1000ms (hero animations, reveals)
```

### 8.4 Disable Animations on Reduced Motion

```tsx
<motion.div
  transition={{ duration: 0.6 }}
  className="motion-safe:animate-fade-in"
>
  This respects `prefers-reduced-motion`
</motion.div>
```

---

## 9. Component Patterns & Conventions

### 9.1 Button Variants (shadcn/ui)

```tsx
import { Button } from "@/components/ui/button";

// Primary button (blue, solid)
<Button>Click me</Button>

// Outlined/ghost variant (transparent, bordered)
<Button variant="outline">Cancel</Button>

// Link-like button (minimal, blue text)
<Button variant="ghost">Learn more</Button>

// Destructive variant (red background)
<Button variant="destructive">Delete</Button>

// Secondary button (light background)
<Button variant="secondary">Secondary</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With icon (left or right)
<Button>
  <ChevronRight className="ml-2 h-4 w-4" />
  Next
</Button>
```

### 9.2 Badge & Pill Patterns

```tsx
// Rounded pill badge (primary)
<span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
  New
</span>

// Pill with secondary color
<span className="rounded-full border border-secondary bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary-foreground">
  In Progress
</span>

// Muted badge (disabled/inactive)
<span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground opacity-60">
  Inactive
</span>
```

### 9.3 Input & Form Patterns

```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Standard text input
<Input placeholder="Enter text" className="w-full" />

// Textarea (Vietnamese diacritics auto-fixed)
<Textarea placeholder="Enter message" rows={4} />

// Select dropdown
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Choose option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>

// With label
<label className="block text-sm font-medium">
  Label
  <Input placeholder="Input with label" className="mt-1" />
</label>
```

### 9.4 Popover & Dropdown Patterns

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <div className="space-y-2">
      <h4 className="font-semibold">Popover title</h4>
      <p className="text-sm text-muted-foreground">Content here</p>
    </div>
  </PopoverContent>
</Popover>
```

### 9.5 Client Component Convention

Always add `"use client"` directive to components using React hooks, state, or browser APIs:

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function InteractiveComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className={cn("transition-all", isOpen && "open")}>
      {/* Interactive content */}
    </div>
  );
}
```

---

## 10. Image Hosting & Optimization

### 10.1 Supported Image Hosts

Images must be from these configured hosts (in `next.config.ts`):

```ts
remotePatterns: [
  { protocol: "http", hostname: "localhost", port: "9000" },      /* Local dev */
  { protocol: "https", hostname: "minio.hcmutertic.com" },         /* MinIO (S3-compatible) */
  { protocol: "https", hostname: "res.cloudinary.com" },           /* Cloudinary CDN */
  { protocol: "https", hostname: "cdn.example.com" },              /* Additional CDNs */
]
```

### 10.2 Image Component Pattern

```tsx
import Image from "next/image";

// With fixed dimensions (preferred for known sizes)
<Image
  src="https://minio.hcmutertic.com/bucket/image.jpg"
  alt="Descriptive alt text"
  width={400}
  height={300}
  priority           // For above-the-fold images
  className="rounded-lg"
/>

// With fill + object-fit (for responsive/hero images)
<div className="relative h-96 w-full">
  <Image
    src="https://minio.hcmutertic.com/bucket/hero.jpg"
    alt="Hero image"
    fill
    priority
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1280px"
  />
</div>

// External image with loader optimization (example)
<Image
  src="image.jpg"
  alt="Optimized image"
  width={600}
  height={400}
  loader={({ src, width, quality }) => 
    `https://cdn.example.com/optimize?url=${src}&w=${width}&q=${quality || 75}`
  }
/>
```

### 10.3 Image Best Practices

- Always provide descriptive `alt` text (for accessibility)
- Use `priority` for hero/above-fold images only
- Use `fill` + `object-cover` for responsive containers
- Provide `sizes` prop for responsive images
- Optimize images before upload (use Cloudinary or MinIO transforms)
- Store original images in MinIO, serve via CDN URL

---

## 11. Darkmode Toggle & Theme Detection

### 11.1 Dark Mode Indicator

The site includes CSS variables for both light and dark themes:

```css
:root {
  /* Light theme variables (default) */
  --primary: oklch(0.5505 0.2485 262.5896);
  ...
}

.dark {
  /* Dark theme variables (when .dark class is present) */
  --primary: oklch(0.6357 0.1959 260.1213);
  ...
}
```

### 11.2 Applying Dark Theme

Dark mode is controlled by adding the `.dark` class to the `<html>`:

```tsx
// In client component or middleware
<html className={isDarkMode ? "dark" : ""}>
  {/* All colors auto-switch via CSS variables */}
</html>
```

### 11.3 Testing Dark Mode

All colors automatically adapt when `.dark` class is present. No component-level changes needed — only CSS variables change.

---

## 12. Component Creation Checklist for AI Agents

When generating a new component or section, follow this checklist:

- [ ] **Colors**: Use only CSS variables (`--primary`, `--foreground`, etc.), never hard-coded hex
- [ ] **Typography**: Use `font-sans` (default), weights 400/600/700 only
- [ ] **Spacing**: Use Tailwind scale (no arbitrary values like `p-[23px]`)
- [ ] **Buttons**: Use shadcn/ui `Button` component, not custom styled buttons
- [ ] **Cards**: Use `border border-border bg-card` pattern with rounded corners
- [ ] **Images**: Use `<Image>` from `next/image` with `alt` and `priority`
- [ ] **Borders**: Use `--border` color, never hard-coded grays
- [ ] **Shadows**: Use `shadow-sm` / `shadow-md` / `shadow-lg`, never custom box-shadows
- [ ] **Responsive**: Use `sm:`, `md:`, `lg:` prefixes, test on mobile
- [ ] **Animations**: Use Framer Motion with `motion-safe:` for accessibility
- [ ] **Dark mode**: All colors should work in both light/dark via CSS variables
- [ ] **Vietnamese text**: Inputs auto-have `line-height: 2.05` for diacritics
- [ ] **Client component**: Add `"use client"` if using hooks or setState
- [ ] **Accessibility**: Include `alt` text, proper `aria-*` attributes, semantic HTML
- [ ] **Imports**: Use correct paths (`@/components/ui/`, `@/lib/utils`, `motion/react`)

---

## 13. Example: Creating a Feature Card Section

### Full Example: Complete Feature Card Component

```tsx
"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { Zap, Code, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  cta?: { label: string; href: string };
}

function FeatureCard({
  icon,
  title,
  description,
  image,
  imageAlt = "Feature image",
  cta,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md"
    >
      {/* Icon or Image Header */}
      {image ? (
        <div className="relative mb-4 h-40 w-full overflow-hidden rounded-md">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="mb-4 text-4xl text-primary">{icon}</div>
      )}

      {/* Content */}
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>

      {/* CTA Button */}
      {cta && (
        <a
          href={cta.href}
          className="inline-flex items-center text-primary transition hover:underline"
        >
          {cta.label}
          <Zap className="ml-2 h-4 w-4" />
        </a>
      )}
    </motion.div>
  );
}

/* Features Grid Section */
export function FeatureShowcase() {
  const features: FeatureCardProps[] = [
    {
      icon: <Code className="h-full w-full" />,
      title: "Modern Stack",
      description: "Built with React 19, TypeScript, and Next.js 16 for performance.",
      cta: { label: "Learn stack", href: "/docs/stack" },
    },
    {
      icon: <Palette className="h-full w-full" />,
      title: "Design System",
      description: "OKLCH colors, consistent spacing, accessible components.",
      cta: { label: "View design", href: "/design" },
    },
    {
      icon: <Zap className="h-full w-full" />,
      title: "Fast Loading",
      description: "Optimized images, lazy loading, and edge caching.",
      cta: { label: "Performance", href: "/perf" },
    },
  ];

  return (
    <section className="w-full px-[var(--site-px)] py-16 md:px-[var(--site-px-lg)]">
      <div className="mx-auto max-w-[80rem]">
        {/* Section Header */}
        <div className="mb-12 space-y-2 text-center">
          <h2 className="text-3xl font-bold text-foreground">Our Features</h2>
          <p className="text-muted-foreground">
            Everything you need, built with care.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Design Pattern Breakdown**:
1. Uses `"use client"` (interactive with Framer Motion)
2. Colors: `--border`, `--foreground`, `--primary`, `--muted-foreground` (variables only)
3. Spacing: `p-6`, `mb-4`, `gap-6` (Tailwind scale)
4. Shadows: `shadow-sm` default, `hover:shadow-md` on interaction
5. Border: `border border-border`
6. Typography: `font-semibold` for heading, `text-sm` for description
7. Button: Custom link-style CTA with icon (no Button component needed here)
8. Image: `<Image>` with `fill` + `object-cover` + responsive `sizes`
9. Responsive: Grid changes from 1→2→3 columns across breakpoints
10. Dark mode: All colors auto-adapt via CSS variables
11. Accessibility: Proper heading hierarchy, image alt text, color contrast

---

## 14. Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| Use OKLCH color space | Perceptually uniform, modern browsers support, better consistency than hex |
| Fixed aspect ratio on hero | Guarantees zero crop on all devices, improves design visibility |
| Page-border-x pattern | Creates visual frame at content boundaries, enhances perceived structure |
| CSS variables over Tailwind | Enables theme switching, reduces build output, centralizes design tokens |
| Framer Motion (motion/react) | Better animation performance, smaller bundle than react-spring |
| shadcn/ui components | Unstyled by default, fully customizable, accessible baseline |
| flow-root on editors | Prevents float height collapse, enables complex layouts in rich-text editor |

---

## 15. Future Considerations

- **Implement dark mode toggle**: Currently dark mode is CSS-only; add UI control
- **Add animation presets**: Create reusable motion component library
- **Extend color palette**: Consider adding semantic color aliases (success, warning, info)
- **Document breakpoint aliases**: Custom breakpoint names for project-specific sizes
- **Accessibility audit**: WCAG 2.1 AA compliance verification
- **Performance monitoring**: Track Core Web Vitals for image loading and animation smoothness

---

**Last Updated**: May 2026  
**Version**: 1.0 (Initial Design System)  
**Maintained by**: Frontend Team (AI Agent Compatible)
