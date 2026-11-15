# DENRYU — 3D Asset & Media Provenance / License Log

All 3D geometry, interactive schematics, and visual media shipped in **DENRYU** comply strictly with `ASSET_GUIDELINES.md` Section 8 (Permitted Licenses Only).

| Asset / Scope | Source / Implementation | Author | License | Notes |
|---|---|---|---|---|
| `SubAReservoirDam.tsx` .. `SubFDischarge.tsx` (All 36 `comp-*` nodes) | Original parametric & analytically triangulated procedural Three.js meshes bound to `manifest.json` (`apps/web/public/models/manifest.json`) | DENRYU Implementation | Original Project Asset (MIT-compatible) | Zero external third-party `.glb` files; 15 double-curved Francis blades, 20 pivoting guide vanes, tapering helical volute, 24-pole rotor implemented procedurally with `userData.componentId` tags ready for optional GLB overrides. |
| `PlantSchematic2DFallback.tsx` | Original interactive 2D engineering schematic SVG (`36` clickable component anchors) | DENRYU Implementation | Original Project Asset (MIT-compatible) | Automatically engaged when WebGL2 is unavailable (`AC-17`). |
| `data/reference-data/glossary-and-refs.json` | Educational domain descriptions & bibliography citations | DENRYU Documentation & Implementation | Original Project Content | Cites IEC 60041, IEC 60193, USBR Monograph No. 20, IEEE Std C50.12, and engineering textbooks cleanly. |
