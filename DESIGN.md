# DESIGN — Visual Identity, 3D Visual Language & Interaction Design

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Specification Baseline

---

## 1. Visual Identity & Aesthetic Direction

DENRYU blends four visual disciplines:
1. **Modern Science Museum:** Intentional dark negative space allowing illuminated mechanical/hydraulic structures to stand out clearly.
2. **Engineering Laboratory:** Precision hairline borders, tabular numerals, explicit SI units, and clear hierarchy without decorative fluff.
3. **Industrial Digital Twin:** High-contrast cyan/water-blue telemetry, crisp component selection outlines, and schematic relationship breadcrumbs.
4. **Technical Education Platform:** Scannable multi-tab explanations paired beside persistent visual context.

**Explicit Anti-Patterns (Prohibited):**
- Generic BI dashboard cards with thick drop shadows or multi-color rainbow gradients.
- Heavy frosted-glass blur everywhere (`backdrop-blur-xl` obscuring 3D details).
- Excessive cyberpunk/neon glow effects that distort realistic industrial materials.
- Fake animated counters, non-functional toggle switches, or ungrounded telemetry numbers.

---

## 2. Semantic Design Token System

### 2.1 Color Palette Tokens

| Token Name | Hex Value | CSS Variable | Semantic Usage |
|---|---|---|---|
| `bg.canvas` | `#0B1016` | `--denryu-bg-canvas` | Root application background and 3D scene sky/backdrop floor. |
| `bg.surface` | `#151E27` | `--denryu-bg-surface` | Inspector drawers, hierarchy panels, navigation rail, simulator controls. |
| `bg.elevated` | `#202C37` | `--denryu-bg-elevated` | Hover states, active cards, popovers, modal dialogs, table headers. |
| `border.subtle` | `#2B3B4A` | `--denryu-border-subtle` | `1px` panel dividers and card strokes. |
| `border.focus` | `#36C5D9` | `--denryu-border-focus` | Keyboard focus ring (`2px solid`) and active selected component outline. |
| `text.primary` | `#EEF4F8` | `--denryu-text-primary` | Headings, component titles, primary numeric readouts (`>= 12:1` contrast). |
| `text.secondary` | `#9FB1C2` | `--denryu-text-secondary` | Explanatory prose, labels, parameter descriptions (`>= 6.5:1` contrast). |
| `text.muted` | `#697D91` | `--denryu-text-muted` | Captions, disclaimers, inactive breadcrumb text (`>= 4.5:1` on surface). |
| `accent.primary` | `#36C5D9` | `--denryu-accent-cyan` | Interactive controls, selected component rim highlight, electrical telemetry accent. |
| `accent.water` | `#2589D8` | `--denryu-accent-water` | Reservoir, penstock water column, hydraulic power & flow indicators. |
| `accent.energy` | `#F5B942` | `--denryu-accent-energy` | Mechanical torque, generator excitation, transformer/grid power indicators. |
| `status.success` | `#32C786` | `--denryu-status-success` | Normal operating point, BEP zone, backend healthy, tests verified. |
| `status.warning` | `#F59E0B` | `--denryu-status-warning` | Part-load cavitation risk, gate/head constraint clamped, backend offline notice. |
| `status.error` | `#EF4444` | `--denryu-status-error` | Over-limit validation error, load deficit alarm, WebGL/WASM initialization fault. |

### 2.2 Data Visualization Series Tokens
- **Hydraulic Power ($P_h$):** `#2589D8` (Water Blue)
- **Mechanical Power ($P_m$):** `#36C5D9` (Primary Cyan)
- **Electrical Generated / Delivered ($P_e$):** `#F5B942` (Energy Yellow)
- **System Losses ($\Delta P_{\text{loss}}$):** `#697D91` / `#EF4444` (for overload/deficit)
- **BEP Optimal Zone Shading:** `rgba(50, 199, 134, 0.14)`

---

## 3. Typography System

| Role | Font Stack | Size / Line Height | Weight | Tracking & Rules |
|---|---|---|---|---|
| **Display / Hero** | `'Space Grotesk', 'Inter', system-ui, sans-serif` | `2.25rem–3.25rem` / `1.1` | `600–700` | Tight `-0.02em`; Overview headline only. |
| **Section Heading** | `'Space Grotesk', 'Inter', system-ui, sans-serif` | `1.25rem–1.5rem` / `1.25` | `600` | Clear hierarchy for page headers and subsystem banners. |
| **Component Title** | `'Inter', system-ui, sans-serif` | `1.125rem` / `1.3` | `600` | Paired directly with monospace `componentId` chip. |
| **Body Copy** | `'Inter', system-ui, sans-serif` | `0.875rem–0.9375rem` / `1.6` | `400` | Max line width `68ch` in inspector and library prose. |
| **Technical Labels** | `'JetBrains Mono', 'Fira Code', monospace` | `0.75rem` / `1.3` | `500` | Uppercase `0.06em` tracking for subsystem tags and stage IDs. |
| **Numerical Readouts** | `'JetBrains Mono', monospace` | `1.0rem–2.0rem` / `1.1` | `600` | **Mandatory** `font-variant-numeric: tabular-nums;` to eliminate jitter during live updates. |

---

## 4. 3D Visual Language & PBR Materials

| Physical Subject | Material Profile | Base Color / Hex | Roughness | Metalness | Visual Treatment Notes |
|---|---|---|---|---|---|
| **Concrete Dam & Powerhouse** | Matte reinforced concrete | `#6D7680` | `0.88` | `0.05` | Subtle ambient occlusion in joints; warm-cool contrast under key light. |
| **Terrain / Cutaway Earth** | Layered architectural plinth | `#1B242E` | `0.95` | `0.00` | Grounded museum cutaway cross-section slab rather than noisy grass. |
| **Penstock & Inlet Valve** | Industrial coated steel | `#3D4E5E` | `0.45` | `0.78` | Flanged joints and circumferential stiffener rings for scale cues. |
| **Spiral Casing & Draft Tube** | Cast/welded steel alloy | `#4E5E6E` | `0.42` | `0.82` | Supports dynamic opacity reduction (`opacity: 0.22`) during internal inspection & Journey Stage 04. |
| **Francis Runner & Blades** | Machined stainless/bronze alloy | `#B6C4D1` | `0.24` | `0.92` | High specular edge definition so curved 3D blade twist is clearly readable. |
| **Guide Vanes / Stay Vanes** | Brushed steel alloy | `#7E8F9F` | `0.32` | `0.88` | Guide vanes animate pivot rotation proportionally to `guideVaneOpeningPct`. |
| **Generator Stator & Housing** | Graphite & industrial slate | `#2B3540` | `0.55` | `0.60` | Copper stator winding end-turns (`#B86B35`, metalness `0.88`) exposed in cutaway. |
| **Generator Rotor & Shaft** | Forged steel + laminated poles | `#8C9BA8` | `0.30` | `0.90` | Salient pole windings accented in muted copper `#C4773B`; rotates at synced visual speed. |
| **Water (Reservoir, Flow, Tailrace)** | Translucent physical water | `#2589D8` | `0.15` | `0.05` | `transparent: true, opacity: 0.58`; directional streamline particles show velocity vector cleanly. |
| **Electrical Energy Indicators** | Restrained emissive lines | `#36C5D9` / `#F5B942` | `0.30` | `0.20` | Low-bloom animated current pulses along busbar, transformer, and switchyard lines. |

### 4.1 Selection, Highlight & State Shading
- **Hover:** Subtle cyan fresnel/emissive tint (`#36C5D9`, intensity `0.25`) + pointer cursor + floating tooltip showing component name and subsystem.
- **Selected:** Crisp cyan selection rim (`#36C5D9`, intensity `0.55`) and subtle bounding bracket indicator.
- **Isolated:** Selected component/subsystem stays opaque (`1.0`); all other components fade to wireframe/ghost (`opacity: 0.08`, non-clickable until isolate exited) OR hide completely via toggle.
- **Exploded View:** Components displace smoothly (`lerp`) along pre-assigned outward engineering vectors defined in `ASSET_GUIDELINES.md` with faint dashed assembly axis lines.
- **Section Cut:** Three.js `gl.localClippingEnabled = true` with visual translucent clipping frame plane along X, Y, or Z axis (`[0%–100%]` travel) revealing internal turbine runner, guide vanes, and generator air gap.

---

## 5. Interaction Design Specification

| Interaction | Desktop Input | Touch / Tablet Input | System Response |
|---|---|---|---|
| **Orbit Camera** | Left-click + drag | 1-finger drag | Damped orbital rotation (`enableDamping = true`, polar angle constrained above ground plinth). |
| **Pan Camera** | Right-click + drag or `Shift + Left-drag` | 2-finger drag | Translates target within bounded plant bounding box. |
| **Zoom** | Scroll wheel | Pinch gesture | Smooth dolly bounded between `minDistance: 2.5 m` (blade inspection) and `maxDistance: 160 m` (full dam). |
| **Select Component** | Left-click mesh (drag < `4 px`) | Tap mesh | Selects `componentId`, highlights mesh, frames gently if `autoFocus` enabled, updates Inspector. |
| **Reset View** | `R` key or Toolbar button | Toolbar button | Smoothly transitions camera back to active page default preset (`750 ms` ease-out cubic, instant if Reduced Motion). |
| **Section Cut Scrub** | Slider + Axis radio (`X/Y/Z`) | Slider + Axis pill | Shifts clipping plane across plant/sub-assembly bounds in real time. |
| **Exploded Scrub** | Slider (`0–100%`) + Quick `Assemble/Explode` toggle | Slider + Toggle | Interpolates local offset vectors of casing, cover, rotor, housing, and runner parts. |

---

## 6. Page-by-Page UI Layouts

### 6.1 Page 1: Overview (`/`)
- **Layout:** Full-bleed dark 3D hero viewport (`68vh` min) with restrained left-aligned editorial overlay (`DENRYU`, subtitle, `Explore Plant Anatomy` primary CTA, `Start Energy Journey` secondary CTA), followed below the fold by Reference Configuration summary strip and 6 Subsystem Portal Cards (`A–F`).
- **3D Behavior:** Slow gentle orbital drift (pauses immediately on user pointer interaction or Reduced Motion), live water flow through intake/penstock/tailrace, rotating turbine & generator cutaway hint.

### 6.2 Page 2: Plant Anatomy (`/anatomy`)
- **Desktop Layout (`>= 1280 px`):**
  - **Left Sidebar (`280 px`):** Search input + Subsystem/Component Tree (`6 subsystems`, `36 components`) with eye (hide/show) and focus icons per item.
  - **Center (`flex-1`):** 3D Viewport with floating top-center **Inspection Toolbar** (Camera Presets dropdown, Exploded slider, Section Cut popover, Isolate toggle, Labels toggle, Reset View) and contextual **Francis Runner Mode Bar** (appears whenever `comp-runner` or `comp-runner-blades` is selected: `Normal | Exploded | Cross-Section | Blade Inspection | Water Flow`).
  - **Right Inspector (`380 px`):** Selected component header (`Name`, `ID`, `Subsystem Badge`), tabbed educational brief (`Overview & Principle`, `Construction & Operation`, `Parameters & Failure`), and clickable **System Relationships** (`Upstream ← [Current] → Downstream`).
  - **Bottom Tray (`collapsible, 140 px`):** Quick Engineering Parameters strip & Related Energy Journey stage shortcut.
- **Tablet / Mobile (`< 1280 px`):** 3D Viewport occupies top `50–55vh`; Tree and Inspector collapse into bottom swipeable/tabbed sheets.

### 6.3 Page 3: Energy Journey (`/journey`)
- **Layout:** Dominant 3D Viewport (`~70%` width on desktop) + Right Guided Stage Panel (`400 px`) + Bottom Horizontal 9-Stage Stepper Bar (`01` through `09`).
- **Behavior:** Clicking a stage (or pressing `Play` / `Next`) animates the camera to the stage's `cameraTarget`, reveals interior flow by fading outer shells (`spiral-casing`, `generator-housing`), pulses directional water/torque/current lines, and renders the stage's physical explanation, equation, and loss summary.

### 6.4 Page 4: Generation Simulator (`/simulator`)
- **Layout:** Left Parameter Control Deck (`340 px`) + Center/Top Paired 3D Turbine-Generator Cutaway + Live KPI Strip (`Hydraulic Power`, `Mechanical Power`, `Electrical Output`, `Torque`, `Speed`, `Overall Efficiency`) + Bottom 2x2 Recharts Grid (`Power Conversion Cascade`, `Turbine Efficiency vs. Discharge Operating Curve`, `Available Power vs. Requested Load`, `Cumulative Energy Over Time`).
- **Explicit Banner:** Top-right pill badge: `SYNTHETIC EDUCATIONAL MODEL — NOT VALIDATED PLANT TELEMETRY`.

### 6.5 Page 5: Engineering Insights (`/insights`)
- **Layout:** Top Active State Diagnostic Summary card (auto-generated from active simulator output vs. Baseline Scenario A) + 2-column Analysis Grid (`Energy Loss Waterfall`, `Operating Point Assessment`, `Scenario A–E Comparison Table`, and `Python Sensitivity Sweep Lab` with graceful offline fallback indicator).

### 6.6 Page 6: Technical Library (`/library`)
- **Layout:** Searchable multi-section reference reader with sticky left section nav (`Equations & Units`, `Engineering Assumptions & Limitations`, `Technical Glossary`, `Standards & Bibliography`), clean KaTeX-rendered formulas, and unit conversion reference table.

---

## 7. Accessibility, Reduced Motion & WebGL Fallback

1. **Keyboard Navigation:** Every tree node, stage button, runner mode pill, slider, and tab is reachable via `Tab` / `Arrow` keys with visible `#36C5D9` focus outlines.
2. **Reduced Motion (`AC-18`):** Detected automatically via `window.matchMedia('(prefers-reduced-motion: reduce)')` and toggleable in the top header. When enabled:
   - Overview camera auto-orbit stops.
   - Camera transitions snap smoothly in `0 ms` instead of sweeping fly-throughs.
   - Flowing water particles switch to static directional streamline chevrons.
3. **WebGL2 Fallback (`AC-17`):** If `WebGL2RenderingContext` is unavailable or fails creation, the viewport mounts `PlantSchematic2DFallback` — a clean, interactive vector cross-section schematic of the dam, penstock, Francis turbine, generator, transformer, switchyard, and tailrace where clicking any zone selects the exact same `componentId` and drives the Inspector and Energy Journey seamlessly.
