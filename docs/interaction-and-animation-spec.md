# Workmesh Interaction & Animation Specification

**Document Version:** 1.1.0  
**Status:** Approved for Implementation  
**Design Foundation:** `.agents/skills/design-system/SKILL.md`  
**Companion Spec:** [docs/ui-design-spec.md](file:///d:/Projects/Workmesh/docs/ui-design-spec.md)  
**Core Philosophy:** Tactile, Purposeful, Frictionless, Minimal  

---

## 1. Motion Philosophy

In Workmesh, animation is not decoration—it is **communicative feedback**. Because Workmesh bridges autonomous AI agents with human developers, animations serve three critical duties:
1. **Instant Tactile Acknowledgement (0ms Feedback)**: Users must know the exact microsecond an interaction registers (e.g., clicking a card immediately initiates a spinner and navigation lock before network latency occurs).
2. **Spatial Continuity**: Elements do not abruptly blink in and out; they glide with natural momentum, preventing layout disorientation.
3. **Restrained Editorial Polish**: No playful bounces, cartoon wobbles, or gratuitous delays. Animations are snappy, confident, and accelerate workflows.

---

## 2. Motion Design Tokens

To ensure DRY and standardized animations across all components, the system defines standardized timing and easing tokens:

### 2.1 Duration Scale
| Token | Duration | Purpose |
| :--- | :--- | :--- |
| `--duration-instant` | `100ms` | Micro-presses, active scale snaps, icon toggles. |
| `--duration-fast` | `150ms` | Button hover states, input border shifts, tab highlights. |
| `--duration-standard`| `200ms` | Card hover elevations, modal dismissals, sibling dimming. |
| `--duration-smooth` | `260ms` | Modal window entrances, drawer slides, accordion unfolds. |
| `--duration-ambient` | `1500ms` | Continuous background pulses (skeleton shimmers, spinners). |

### 2.2 Easing Curves
```css
:root {
  /* Fast deceleration: feels crisp, responsive, and tactile */
  --ease-editorial: cubic-bezier(0.16, 1, 0.3, 1);

  /* Symmetric standard curve for color blending and fades */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

  /* Acceleration curve for exits */
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);
}
```

---

## 3. Comprehensive Interaction & Animation Catalog

### 3.1 Global Navigation (`<TopNav />`)
* **Brand Mark (`.brand-link`)**:
  * **Hover**: Subtle opacity shift to `0.82` over `150ms ease`.
  * **Active (Click)**: Micro-scale down `transform: scale(0.98)` over `100ms`.
* **Theme Toggle Button (`.theme-toggle-btn`)**:
  * **Hover**: Subtle tilt `transform: rotate(15deg);` over `180ms var(--ease-editorial)`.
  * **Active (Click)**: `transform: scale(0.90) rotate(45deg);` over `100ms`.
  * **Mode Change**: Dynamic root CSS custom property interpolation (`transition: background-color 0.2s ease, color 0.2s ease`).
* **Header Border Alignment**:
  * Inset border line (`maxWidth: 1200px; margin: 0 auto;`) creates seamless vertical alignment with the main content canvas.

### 3.2 Breadcrumb Navigation (`<Breadcrumbs />`)
* **Link Hover (`.breadcrumb-link`)**:
  * **Hover**: Text color shifts from `var(--text-secondary)` to `var(--text-primary)` with subtle underline over `150ms ease`.
  * **Active**: Micro-press `transform: scale(0.98);` over `100ms`.

### 3.3 Project Hub Directory (`/` Route)
* **Project Cards (`.project-card`)**:
  * **Entrance**: Staggered cascading load (`animation: cardEntrance 0.3s var(--ease-editorial) both; animation-delay: calc(var(--index) * 0.05s);`).
  * **Hover**:
    * Lift: `transform: translateY(-2px);`
    * Theme-Harmonious Elevation: Clean 1px hairline border focus (`0 0 0 1px color-mix(in srgb, var(--theme-card-text) 14%, transparent)`) + featherweight ambient depth (`0 6px 16px -6px color-mix(in srgb, var(--theme-card-text) 18%, transparent)`), avoiding dirty black smudges on colored card surfaces.
    * Arrow slide: Nested `.card-arrow` glides right `transform: translateX(4px);` over `200ms var(--ease-editorial)`.
  * **Click / Navigation Trigger (0ms Tactile Lock)**:
    * **Clicked Card**: Immediate transformation to `cursor: progress; opacity: 0.88;`, button arrow morphs into `<Spinner size="xs" /> Opening workspace...`.
    * **Sibling Cards**: Immediate lock to `pointer-events: none; opacity: 0.45;` over `200ms ease`, preventing concurrent clicks on slow networks.

### 3.4 Modal Windows & Dialogs (`<Modal />`)
* **Backdrop (`.animate-backdrop`)**:
  * **Entrance**: Opacity `0` $\rightarrow$ `1` with `backdrop-filter: blur(4px);` over `180ms var(--ease-editorial)`.
* **Modal Dialog (`.animate-modal`)**:
  * **Entrance**: `opacity: 0; transform: scale(0.96) translateY(8px);` $\rightarrow$ `opacity: 1; transform: scale(1) translateY(0);` over `220ms var(--ease-editorial)`.
* **Close Button**:
  * **Hover**: Background tint `var(--surface)` with text contrast shift (`150ms`).
  * **Active**: `transform: scale(0.95);` (`100ms`).

### 3.5 Form Elements & Theme Swatches (`<CreateProjectModal />`)
* **Text Inputs & Textareas**:
  * **Focus**: Crisp border color shift to `var(--border-focus)` + outline bloom `box-shadow: 0 0 0 3px rgba(49, 44, 133, 0.12);` over `180ms ease`.
* **Live Ticket Key Preview Badge (`.animate-badge-pop`)**:
  * Pops into view when $\ge 2$ characters are typed:
    ```css
    @keyframes badgePop {
      0% { opacity: 0; transform: translateY(-4px) scale(0.95); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    ```
* **Theme Preview Swatch Cards (`.theme-preview-card`)**:
  * **Hover**: Lift `transform: translateY(-2px);` and border contrast intensification over `150ms var(--ease-editorial)`.
  * **Active (Click)**: `transform: scale(0.97);` over `100ms`.
  * **Selected**: Snap to `border: 2px solid var(--accent-primary); box-shadow: 0 0 0 2px rgba(49, 44, 133, 0.25);` with checkmark badge pop.

### 3.6 Buttons & Interactive Controls
* **Primary Buttons (`.btn-primary`)**:
  * **Hover**: Background transition to `var(--accent-primary-hover)` + elevation bloom `box-shadow: 0 4px 14px rgba(49, 44, 133, 0.25);` (`150ms`).
  * **Active (Click Down)**: `transform: scale(0.97);` (`100ms`).
* **Secondary Buttons (`.btn-secondary`)**:
  * **Hover**: Background tint `var(--surface)` with text contrast shift (`150ms`).
  * **Active**: `transform: scale(0.97);` (`100ms`).

### 3.7 Project Hub Split Hero Card (`<ProjectHeader />`)
* **Hero Entrance (`.hero-entrance`)**:
  * Smooth entrance slide `opacity: 0; transform: translateY(8px);` $\rightarrow$ `opacity: 1; transform: translateY(0);` over `240ms var(--ease-editorial)`.
* **Telemetry "+ Propose Feature" Button**:
  * Inherits `.btn-primary` with tactile press down and crisp elevation bloom.

### 3.8 View Switcher Tabs (Kanban vs List)
* **Tab Switcher Buttons (`.view-switcher-button`)**:
  * **Transition**: Background and depth shadow shift over `180ms var(--ease-editorial)`.
  * **Active Tab**: Background `var(--surface-raised)`, `box-shadow: 0 1px 3px rgba(0,0,0,0.08)`, and text `var(--text-primary)`.
  * **Inactive Hover**: Text color shifts to `var(--text-primary)` over `150ms ease`.
  * **Click Down**: Micro-press `transform: scale(0.97);` (`100ms`).

### 3.9 Epics Roadmap Filter Bar (`<EpicsFilterBar />`)
* **Filter Pills (`.filter-pill`)**:
  * **Hover**: Micro-lift `transform: translateY(-1px);` + border tint over `150ms var(--ease-editorial)`.
  * **Active (Click Down)**: `transform: scale(0.96);` over `100ms`.
  * **Selected State**: Seamless background shift to `var(--accent-primary)` with count badge opacity blend.

### 3.10 Kanban Board & Feature Cards (`<FeatureCard />`)
* **Column Containers**:
  * Column count badge updates smoothly with zero layout disruption.
* **Feature Cards (`.feature-card`)**:
  * **Hover**:
    * Lift: `transform: translateY(-2px);`
    * Shadow: `box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);` (light) / `box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);` (dark).
    * Border tint: Accent color mix `rgba(49, 44, 133, 0.25);`.
  * **Active (Click Down)**: Tactile press `transform: scale(0.98);` over `100ms`.
  * **Criteria Checklist Counter**: Icon and count maintain stable typography with no jitter.

### 3.11 Features List View (`<FeaturesListView />`)
* **Table Rows (`.list-table-row`)**:
  * **Hover**: Subtle row highlight `background-color: rgba(0, 0, 0, 0.025);` (light) / `rgba(255, 255, 255, 0.035);` (dark) over `150ms ease`.
* **Action Link ("View ->") (`.action-link`)**:
  * **Hover**: Nested arrow icon glides right `transform: translateX(3px);` over `150ms var(--ease-editorial)`.
  * **Active**: `transform: scale(0.96);` (`100ms`).

### 3.12 Asynchronous & Loading States
* **Continuous Skeleton Shimmer (`<ProjectBoardSkeleton />`)**:
  * Shared between Next.js `loading.tsx` and TanStack Query `isLoading` to eliminate double-loading flashes.
  * Smooth opacity shimmer:
    ```css
    @keyframes shimmer {
      0% { opacity: 0.45; }
      50% { opacity: 0.90; }
      100% { opacity: 0.45; }
    }
    .skeleton-shimmer {
      animation: shimmer 1.5s ease-in-out infinite;
    }
    ```
* **Spinners (`.animate-spin`)**:
  * Smooth continuous GPU rotation (`1s linear infinite`).

### 3.13 Errors & Feedback Cards
* **Not Found / Error Card (`.error-card`)**:
  * Gentle scale-in entrance: `animation: modalPop 0.25s var(--ease-editorial) both;`.
* **Form Error Messages (`.field-error-text`)**:
  * Crisp slide-down entrance: `animation: slideInDown 0.15s var(--ease-editorial) both;`.

---

## 4. Hardware Acceleration & Performance Best Practices

To guarantee 60fps / 120fps smoothness across low-power and mobile devices:
1. **GPU-Only Properties**: Transitions strictly animate `transform` and `opacity`. Layout-triggering properties (`width`, `height`, `margin`, `padding`, `top`, `left`) are **never** animated.
2. **`will-change` Discipline**: Only applied transiently during active interactions, not permanently on static elements.
3. **No Continuous Layout Thrashing**: Shimmer skeletons animate element opacity, not heavy gradient repaints.

---

## 5. Accessibility & Reduced Motion Support

All animations in Workmesh strictly respect the user's OS-level accessibility preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .skeleton-shimmer {
    animation: none !important;
    opacity: 0.7 !important;
  }
}
```

When reduced motion is enabled:
* Movement (`translateY`, `scale`, `rotate`) is eliminated.
* Transitions become instant or simple static opacity fades, preserving accessibility while maintaining full functionality.
