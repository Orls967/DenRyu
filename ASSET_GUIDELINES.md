# ASSET_GUIDELINES — 3D Modeling, Asset Pipeline & Visualization Standards

**Project:** DENRYU — Power Plant Anatomy & Energy Systems Explorer  
**Document Version:** 1.0.0  
**Status:** Authoritative 3D Asset & Geometry Specification

---

## 1. Asset Philosophy & Three-Level Detail Standard

DENRYU is an interactive engineering laboratory—not an architectural vanity render. Geometry clarity, mechanical accuracy of recognizable engineering silhouettes, clean separation of sub-assemblies, and crisp `60 FPS` interactivity take precedence over photorealistic foliage or heavy textures.

**Three-Level Detail Architecture:**
1. **Level 1 — Plant Assembly:** Coherent site diorama (`~180 m × 90 m × 110 m` conceptual scale) linking reservoir basin, concrete dam, intake, conveyance tunnel/penstock, powerhouse hall, outdoor transformer/switchyard, and tailrace river exit.
2. **Level 2 — Subsystem Assembly:** Cleanly separable mechanical/civil/electrical groups matching `sub-reservoir-dam`, `sub-water-conveyance`, `sub-turbine`, `sub-generator`, `sub-electrical-transmission`, and `sub-discharge`.
3. **Level 3 — Component Detail:** Individual interactive engineering parts (`36` canonical `componentId`s), highlighting highest detail density on `comp-runner`, `comp-runner-blades`, `comp-guide-vanes`, `comp-spiral-casing`, `comp-rotor`, `comp-stator-winding`, `comp-penstock`, and `comp-step-up-transformer`.

---

## 2. Coordinate Systems, Scale & Pivot Conventions

1. **World Coordinate System:** Right-handed Three.js / glTF standard (`+Y` Up, `+X` Downstream from dam toward tailrace/switchyard, `+Z` lateral powerhouse width).
2. **Canonical Units:** `1.0 scene unit = 1.0 meter` (`m`).
3. **Origin (`[0, 0, 0]`):** Centerline axis intersection of the vertical turbine-generator unit at the **Francis runner horizontal centerline (`Y = 0`)**.
   - Setting `[0, 0, 0]` on the turbine shaft vertical axis (`X = 0, Z = 0`) makes axial rotation of `comp-runner`, `comp-runner-blades`, `comp-main-shaft`, and `comp-rotor` strictly around local/world `+Y` with zero translation drift!
4. **Pivot Points:**
   - **Rotating Parts (`comp-runner`, `comp-main-shaft`, `comp-rotor`):** Origin pivot strictly at `(0, y_local, 0)` centered on shaft axis.
   - **Pivoting Wicket Gates (`comp-guide-vanes`):** Each individual instanced guide vane mesh has its origin pivot strictly on its vertical **trunnion stem axis** so rotating all 20 instances synchronously around local `+Y` opens/closes the gate cascade cleanly without penetrating adjacent vanes.
   - **Exploding Covers & Shells:** Local origin positioned at geometric center so `explodeVector` translates cleanly away from `[0, 0, 0]` along clear engineering disassembly vectors.

---

## 3. Canonical 3D Asset & Mesh Inventory (All 36 Components)

| Component ID | Node Name (`GLB`) | Level | Geometry Strategy | Pivot / Animation Hook |
|---|---|---|---|---|
| `comp-reservoir` | `Node_Comp_Reservoir` | L1 | Cutaway water volume + animated surface shader | Static; transparency adjustable |
| `comp-dam` | `Node_Comp_Dam` | L1 | Stepped gravity dam monolith + gallery cutaway | Static concrete shell |
| `comp-water-intake` | `Node_Comp_WaterIntake` | L2 | Flared concrete bellmouth bay on upstream dam | Static |
| `comp-trash-rack` | `Node_Comp_TrashRack` | L2 | Frame + instanced vertical steel bars (`InstancedMesh`) | Explodes `-X` (`[-3, 0, 0]`) |
| `comp-intake-gate` | `Node_Comp_IntakeGate` | L2 | Rectangular steel gate leaf + hoist pedestal | Explodes `+Y` (`[0, +8, 0]`) |
| `comp-spillway` | `Node_Comp_Spillway` | L1 | Ogee crest piers + radial tainter gate + stilling apron | Static |
| `comp-headrace` | `Node_Comp_Headrace` | L2 | Cutaway concrete conduit segment | Static; cutaway capable |
| `comp-pressure-tunnel` | `Node_Comp_PressureTunnel` | L2 | Cylindrical rock/concrete-lined horizontal conduit | Static; cutaway capable |
| `comp-surge-tank` | `Node_Comp_SurgeTank` | L2 | Vertical cylindrical riser shaft + cutaway water column | Explodes `+Y` cap (`[0, +3, 0]`) |
| `comp-penstock` | `Node_Comp_Penstock` | L2 | Inclined steel pipe + flanged joints + stiffener rings + saddles | Upper half fades on cutaway |
| `comp-main-inlet-valve` | `Node_Comp_MainInletValve` | L2 | Flanged valve body + servomotor + lens butterfly disc | Explodes `+Z` (`[0, 0, +2.5]`) |
| `comp-spiral-casing` | `Node_Comp_SpiralCasing` | L3 | True tapering 360° helical volute torus sections | Opacity `0.22` in Stage 04 / Flow Mode |
| `comp-stay-vanes` | `Node_Comp_StayVanes` | L3 | Upper/lower stay rings + 16 instanced hydrofoil pillars | Explodes `+Y` (`[0, +2.2, 0]`) |
| `comp-guide-vanes` | `Node_Comp_GuideVanes` | L3 | Regulating ring + 20 instanced pivoting hydrofoils | Pivots around trunnion axes via `guideVaneOpeningPct` |
| `comp-runner` | `Node_Comp_Runner` | L3 | Upper crown, nose cone, lower band w/ seal rings | Rotates `-Y` at synced visual angular velocity; explodes `[0, -2.5, 0]` |
| `comp-runner-blades` | `Node_Comp_RunnerBlades` | L3 | 15 double-curved radial-to-axial twisted Francis blades | Rotates integrally with `comp-runner`; isolated in Blade Mode |
| `comp-main-shaft` | `Node_Comp_MainShaft` | L3 | Machined vertical shaft + bolted coupling flange + keyway | Rotates `-Y` synced with runner |
| `comp-draft-tube` | `Node_Comp_DraftTube` | L2 | Conical steel throat liner + 90° expanding concrete elbow | Static; section-cut compatible |
| `comp-rotor` | `Node_Comp_Rotor` | L3 | Hub + spider arms + laminated rim + 24 salient poles | Rotates `-Y` synced with shaft; explodes `[0, +4.5, 0]` |
| `comp-stator` | `Node_Comp_Stator` | L3 | Ribbed outer steel frame + slotted laminated core stack | Static; cutaway reveals slots |
| `comp-field-winding` | `Node_Comp_FieldWinding` | L3 | 24 instanced copper coil wraps on rotor poles | Rotates with `comp-rotor` |
| `comp-stator-winding` | `Node_Comp_StatorWinding` | L3 | Slotted copper bars + diamond basket top/bottom end-turns | Highlightable inside stator bore |
| `comp-excitation-system` | `Node_Comp_ExcitationSystem` | L2 | Thyristor AVR cubicle + top shaft slip-ring brush box | Explodes `+Z` (`[0, 0, +2]`) |
| `comp-bearings` | `Node_Comp_Bearings` | L3 | Bearing bracket spider + oil-bath pot + tilting pad collar | Explodes `+Y` (`[0, +2.8, 0]`) |
| `comp-cooling-system` | `Node_Comp_CoolingSystem` | L3 | Circumferential finned radiator banks + water manifolds | Explodes radially outward |
| `comp-generator-housing` | `Node_Comp_GeneratorHousing` | L2 | Cylindrical barrel enclosure + top removable hatch | Opacity `0.16` in Stage 06; explodes `[0, +6.5, 0]` |
| `comp-generator-terminal` | `Node_Comp_GeneratorTerminal` | L2 | Terminal chamber + 3 phase bushings | Static |
| `comp-busbar` | `Node_Comp_Busbar` | L2 | 3 parallel isolated-phase tubular bus ducts | Static |
| `comp-circuit-breaker` | `Node_Comp_CircuitBreaker` | L2 | 3-pole GCB switchgear cubicle + porcelain interrupters | Explodes `+Y` cover |
| `comp-step-up-transformer` | `Node_Comp_StepUpTransformer` | L3 | Tank + radiators + conservator + 3 HV bushings + internal 3-limb core cutaway | Tank shell cutaway in Stage 07 |
| `comp-switchyard` | `Node_Comp_Switchyard` | L2 | Lattice gantry + HV breaker + disconnect + insulators | Static |
| `comp-transmission-line` | `Node_Comp_TransmissionLine` | L1 | Steel lattice pylon + catenary 3-phase ACSR conductors | Animated energy pulse travel |
| `comp-electrical-grid` | `Node_Comp_ElectricalGrid` | L1 | Horizon terminal node pylon + grid sink emblem | Static |
| `comp-draft-tube-outlet` | `Node_Comp_DraftTubeOutlet` | L2 | Twin submerged concrete outlet bays + splitter pier + stoplog slots | Static |
| `comp-tailrace` | `Node_Comp_Tailrace` | L1 | Open concrete tailrace channel + calm blue water surface | Static |
| `comp-downstream-channel` | `Node_Comp_DownstreamChannel` | L1 | Riverbed continuation exiting diorama plinth | Static |

---

## 4. Asset Format, PBR Materials & Interactive Support

1. **Format:** Binary **glTF 2.0 (`.glb`)** compressed with **Draco** or **Meshopt** (`EXT_meshopt_compression`) and embedded or KTX2-compressed PBR textures.
2. **Material Rules:** Use `MeshStandardMaterial` (metallic-roughness workflow) calibrated strictly to `DESIGN.md` Section 4 palette/roughness/metalness values. Avoid baked ambient lighting inside diffuse textures that clashes with dynamic studio lighting.
3. **Section Cut Compatibility:**
   - All enclosed architectural/mechanical shells (`comp-dam`, `comp-penstock`, `comp-spiral-casing`, `comp-draft-tube`, `comp-stator`, `comp-generator-housing`, `comp-step-up-transformer`) MUST be modeled with real finite wall thickness (manifold watertight geometry) OR `DoubleSide` inner face shading with dark interior cap coloration so Three.js clipping planes produce crisp, readable cross-sections without hollow back-face artifacts.
4. **Exploded View:** Smooth `lerp` from `originPos` to `originPos + explodeVector * explodeFactor` (`0.0..=1.0`). Zero intersecting collision jumps during full assembly (`explodeFactor = 0`).
5. **Francis Runner 5-Mode Support:**
   - Mode `normal`: `explodeFactor = 0`, all casing opaque.
   - Mode `exploded`: Local turbine stack offsets applied cleanly (`headCover +Y`, `spiralCasing radial`, `guideVanes +Y`, `runner -Y`).
   - Mode `cross_section`: Activates vertical clipping plane bisecting `X = 0` or `Z = 0` across turbine pit.
   - Mode `blade_inspection`: Isolates `comp-runner` + `comp-runner-blades`, frames close-up camera, highlights 1 hero blade + 3D orientation markers (`Leading Edge / Inlet`, `Trailing Edge / Outlet`).
   - Mode `water_flow`: Sets `comp-spiral-casing` opacity to `0.22` and activates helical streamline ribbons wrapping through spiral → wicket gates → runner blades → draft tube.

---

## 5. Deterministic Metadata Mapping (`componentId`)

Never identify components by fragile fuzzy substring matching on arbitrary artist mesh names!

1. **Primary Binding (`glTF extras`):** Every Blender/CAD assembly node carries custom property `extras.componentId = "comp-..."` (matching `PLANT_ANATOMY_SPEC.md`).
2. **Secondary Manifest Binding (`public/models/manifest.json`):** Maps canonical `componentId` → `{ glbPath, nodeName, explodeVector, supportsCutawayTransparency }` so build-time/unit tests verify **100% 1-to-1 coverage of all 36 `componentId`s** before runtime.
3. **Raycast Resolution Helper (`resolveComponentIdFromObject3D(obj)`):** Walks up `obj.parent` chain until `obj.userData?.componentId` is found; ignores decorative helpers (`isDecorative: true`).

---

## 6. Procedural Geometry vs. External CAD/Blender Assets

**Engineering Honesty Policy:** Coding agents MUST NOT pretend primitive cylinders are industrial CAD models, nor assume an LLM can author complex organic 3D turbine blades cleanly solely via manual vertex arrays without mathematical surface generation or Blender.

- **Tier A — High-Priority Custom Blender/CAD `.glb` Assets:** `comp-spiral-casing`, `comp-runner`, `comp-runner-blades` (parametric NURBS/swept 3D double-curved blade geometry generated cleanly in Blender/Python-Blender script or verified CAD export), `comp-rotor`, `comp-stator-winding`, `comp-step-up-transformer`.
- **Tier B — Clean Engineered Procedural Geometry (Acceptable Fallback / Phase 2 Baseline):** While custom Blender GLBs are authored or refined, parametric Three.js geometries (extruded concrete dam profiles, `TubeGeometry` penstock with instanced stiffener flanges, `LatheGeometry` draft tube cone + swept elbow curve, instanced `ExtrudeGeometry` hydrofoil stay/guide vanes) are explicitly documented as **Phase 2 engineered procedural meshes** sharing the exact same `nodeName` and `userData.componentId` slots so GLBs drop in seamlessly later with zero app code refactoring.

---

## 7. Performance & Memory Budgets

| Metric | Desktop Target | Mobile / Low-Power LOD1 |
|---|---|---|
| Active Triangles (Full Plant) | `<= 180,000` triangles | `<= 75,000` triangles |
| Draw Calls (Instanced) | `<= 90` draw calls | `<= 60` draw calls |
| Total `.glb` Payload (Compressed) | `<= 12 MB` total (`<= 4 MB` initial hero shell) | `<= 6 MB` |
| Texture Resolution | `<= 1024×1024` (max `2048` for terrain/dam) | `<= 512×512` |
| Max Pixel Ratio (`dpr`) | `Math.min(window.devicePixelRatio, 2)` | `Math.min(window.devicePixelRatio, 1.5)` |

- **Instancing Mandate:** `comp-trash-rack` bars, `comp-stay-vanes` (16), `comp-guide-vanes` (20), `comp-runner-blades` (15), `comp-rotor` poles (24), and `comp-cooling-system` radiator fins MUST use `THREE.InstancedMesh` or merged static buffers where individual per-item motion isn't needed.
- **Lazy Loading & Disposal:** Heavy Level 3 interior detail sub-assemblies load progressively after initial overview shell mounts; geometries/materials/textures dispose cleanly on unmount (`useEffect` cleanup).

---

## 8. Licensing & Attribution Policy

1. **Permitted Licenses ONLY:** Public Domain / **CC0**, **CC-BY 4.0** (with explicit attribution entry in `Technical Library -> Asset Credits`), **MIT**, **Apache 2.0**, or **original procedural/Blender assets** authored specifically for DENRYU.
2. **Prohibited Assets:** Royalty-free editorial-only models, `CC-BY-NC` (non-commercial restriction incompatible with open engineering distribution), scraped/unverified CAD files, or proprietary OEM turbine CAD models without written redistribution rights.
3. **Audit Gate:** Every external asset added to `assets/` or `apps/web/public/models/` MUST register an entry in `assets/ASSET_LICENSE_LOG.md` recording filename, author, source URL, and verified license before Phase 2 completion.
