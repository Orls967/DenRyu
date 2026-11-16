import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId, RunnerInspectionMode } from '@/types/domain';

function buildTaperingSpiralGeometry(): THREE.BufferGeometry {
  const segsU = 64;
  const segsV = 20;
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segsU; i++) {
    const t = i / segsU;
    const theta = t * Math.PI * 1.92;
    const majorR = 3.85 - t * 1.05;
    const minorR = 1.45 * (1 - 0.68 * t);
    const cx = Math.cos(theta) * majorR;
    const cz = Math.sin(theta) * majorR;
    const nx = Math.cos(theta);
    const nz = Math.sin(theta);

    for (let j = 0; j <= segsV; j++) {
      const phi = (j / segsV) * Math.PI * 2;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const px = cx + nx * cosP * minorR;
      const py = sinP * minorR;
      const pz = cz + nz * cosP * minorR;
      positions.push(px, py, pz);
      normals.push(nx * cosP, sinP, nz * cosP);
    }
  }

  for (let i = 0; i < segsU; i++) {
    for (let j = 0; j < segsV; j++) {
      const a = i * (segsV + 1) + j;
      const b = (i + 1) * (segsV + 1) + j;
      const c = (i + 1) * (segsV + 1) + j + 1;
      const d = i * (segsV + 1) + j + 1;
      indices.push(a, b, d, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Double-curved Francis runner blade. The mid-surface runs spanwise from the
 * crown (u = 0) to the band (u = 1) and streamwise from the radial leading edge
 * (v = 0) to the axial trailing edge (v = 1), wrapping ~60° at the crown and
 * ~40° at the band. Pressure and suction skins are offset along the true
 * surface normal with a hydrofoil thickness distribution, and the edges are
 * stitched closed so the blade reads as a solid part.
 */
const BLADE_COUNT = 15;

function bladeMidSurface(u: number, v: number, out: THREE.Vector3): THREE.Vector3 {
  const rLE = THREE.MathUtils.lerp(1.34, 1.41, u);
  const yLE = THREE.MathUtils.lerp(0.22, -0.3, u);
  const rTE = THREE.MathUtils.lerp(0.42, 1.12, u);
  const yTE = THREE.MathUtils.lerp(-0.18, -0.8, u);
  // Crown streamlines turn axial early; band streamlines stay radial longer.
  const radialEase = 1 - Math.pow(1 - v, THREE.MathUtils.lerp(1.9, 1.15, u));
  const r = THREE.MathUtils.lerp(rLE, rTE, radialEase);
  const y = THREE.MathUtils.lerp(yLE, yTE, Math.pow(v, THREE.MathUtils.lerp(1.5, 1.1, u)));
  const wrap = THREE.MathUtils.lerp(1.05, 0.7, u);
  const theta = -wrap * Math.pow(v, 0.85) + 0.1 * u;
  return out.set(r * Math.cos(theta), y, r * Math.sin(theta));
}

function buildTwistedFrancisBladeGeometry(): THREE.BufferGeometry {
  const uSteps = 14;
  const vSteps = 22;
  const positions: number[] = [];
  const indices: number[] = [];
  const p = new THREE.Vector3();
  const du = new THREE.Vector3();
  const dv = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const n = new THREE.Vector3();
  const eps = 1e-3;
  const stride = vSteps + 1;
  const layer = (uSteps + 1) * stride;

  for (const side of [1, -1]) {
    for (let i = 0; i <= uSteps; i++) {
      const u = i / uSteps;
      for (let j = 0; j <= vSteps; j++) {
        const v = j / vSteps;
        bladeMidSurface(u, v, p);
        bladeMidSurface(Math.min(1, u + eps), v, tmp);
        du.copy(tmp);
        bladeMidSurface(Math.max(0, u - eps), v, tmp);
        du.sub(tmp);
        bladeMidSurface(u, Math.min(1, v + eps), tmp);
        dv.copy(tmp);
        bladeMidSurface(u, Math.max(0, v - eps), tmp);
        dv.sub(tmp);
        n.crossVectors(du, dv).normalize();
        // NACA-like thickness: blunt leading edge, thin trailing edge.
        const thick = 0.006 + 0.055 * Math.pow(Math.sin(Math.PI * Math.min(1, Math.sqrt(v) * 0.98)), 1.1) * (1 - 0.6 * v);
        positions.push(p.x + n.x * thick * side, p.y + n.y * thick * side, p.z + n.z * thick * side);
      }
    }
  }

  for (let i = 0; i < uSteps; i++) {
    for (let j = 0; j < vSteps; j++) {
      const a = i * stride + j;
      const b2 = (i + 1) * stride + j;
      const c = (i + 1) * stride + j + 1;
      const d = i * stride + j + 1;
      indices.push(a, b2, d, b2, c, d);
      indices.push(layer + a, layer + d, layer + b2, layer + b2, layer + d, layer + c);
    }
  }
  // Close the four edges (LE, TE, crown root, band root).
  const stitch = (i0: number, i1: number) => {
    indices.push(i0, layer + i0, i1, i1, layer + i0, layer + i1);
  };
  for (let i = 0; i < uSteps; i++) {
    stitch((i + 1) * stride, i * stride); // leading edge
    stitch(i * stride + vSteps, (i + 1) * stride + vSteps); // trailing edge
  }
  for (let j = 0; j < vSteps; j++) {
    stitch(j, j + 1); // crown root
    stitch(uSteps * stride + j + 1, uSteps * stride + j); // band root
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildCrownGeometry(): THREE.BufferGeometry {
  const pts = [
    [0.0, 0.64],
    [0.42, 0.64],
    [0.95, 0.6],
    [1.3, 0.44],
    [1.4, 0.3],
    [1.36, 0.2],
    [1.05, 0.17],
    [0.7, 0.08],
    [0.46, -0.06],
    [0.38, -0.12],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 48);
}

function buildBandGeometry(): THREE.BufferGeometry {
  const pts = [
    [1.4, -0.26],
    [1.47, -0.3],
    [1.47, -0.48],
    [1.36, -0.72],
    [1.2, -0.88],
    [1.1, -0.84],
    [1.24, -0.68],
    [1.37, -0.46],
    [1.4, -0.26],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 48);
}

function buildNoseConeGeometry(): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [];
  for (let k = 0; k <= 12; k++) {
    const t = k / 12;
    pts.push(new THREE.Vector2(0.4 * Math.cos((t * Math.PI) / 2) ** 0.8, -0.12 - 0.85 * t));
  }
  pts.reverse();
  return new THREE.LatheGeometry(pts, 32);
}

export function SubCTurbine(
  props: Subsystem3DProps & {
    guideVaneOpeningPct: number;
    angularSpeedRadS: number;
    reducedMotion: boolean;
    runnerMode: RunnerInspectionMode;
  }
) {
  const stayVanesRef = useRef<THREE.InstancedMesh>(null);
  const guideVanesRef = useRef<THREE.InstancedMesh>(null);
  const runnerSpinRef = useRef<THREE.Group>(null);
  const bladesSpinRef = useRef<THREE.Group>(null);

  const spiralGeo = useMemo(() => buildTaperingSpiralGeometry(), []);
  const bladeGeo = useMemo(() => buildTwistedFrancisBladeGeometry(), []);
  const crownGeo = useMemo(() => buildCrownGeometry(), []);
  const bandGeo = useMemo(() => buildBandGeometry(), []);
  const noseGeo = useMemo(() => buildNoseConeGeometry(), []);

  const hydrofoilGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-0.22, 0);
    s.quadraticCurveTo(0, 0.08, 0.24, 0.02);
    s.quadraticCurveTo(0.02, -0.06, -0.22, 0);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.92, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0.46, 0);
    return geo;
  }, []);

  const draftTubeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.0, 0),
      new THREE.Vector3(0, -3.5, 0),
      new THREE.Vector3(1.8, -5.2, 0),
      new THREE.Vector3(5.5, -5.5, 0),
      new THREE.Vector3(11.5, -5.5, 0),
    ]);
    return new THREE.TubeGeometry(curve, 32, 1.35, 18, false);
  }, []);

  // Stay vanes: 16 fixed hydrofoil pillars
  useLayoutEffect(() => {
    const mesh = stayVanesRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const r = 2.38;
      dummy.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      dummy.rotation.set(0, -ang + 0.55, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Guide vanes: 20 pivoting wicket gates rotating synchronously with guideVaneOpeningPct
  useLayoutEffect(() => {
    const mesh = guideVanesRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const openingRad = THREE.MathUtils.lerp(0.05, 0.85, props.guideVaneOpeningPct / 100);
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * Math.PI * 2;
      const r = 1.82;
      dummy.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      dummy.rotation.set(0, -ang + openingRad, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [props.guideVaneOpeningPct]);

  useFrame((_, delta) => {
    if (props.reducedMotion) return;
    // Scale physical 26.18 rad/s gently to visually readable 2.6 rad/s so blade twist remains intelligible
    const visualOmega = Math.min(4.0, props.angularSpeedRadS * 0.11);
    const dTheta = visualOmega * delta;
    if (runnerSpinRef.current) runnerSpinRef.current.rotation.y -= dTheta;
    if (bladesSpinRef.current) bladesSpinRef.current.rotation.y -= dTheta;
  });

  const shared = (id: ComponentId) => ({
    componentId: id,
    explodeFactor: props.explodeFactor,
    hidden: Boolean(props.hiddenIds[id]),
    isolatedId: props.isolatedId,
    selectedId: props.selectedId,
    hoveredId: props.hoveredId,
    highlightedIds: props.highlightedIds,
    transparentIds: props.transparentIds,
    showLabel: props.showLabels && props.selectedId === id,
    onSelect: props.onSelect,
    onHover: props.onHover,
  });

  const isWaterFlowRunnerMode = props.runnerMode === 'water_flow';
  const isBladeInspection = props.runnerMode === 'blade_inspection';

  return (
    <group name="Subsystem_Turbine">
      {/* Spiral Casing (Volute Scroll) */}
      <ComponentGroup
        {...shared('comp-spiral-casing')}
        transparentIds={
          isWaterFlowRunnerMode
            ? [...props.transparentIds, 'comp-spiral-casing']
            : props.transparentIds
        }
        basePosition={[0, 0, 0]}
      >
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh geometry={spiralGeo} castShadow receiveShadow>
              <meshStandardMaterial
                color="#4E5E6E"
                roughness={0.42}
                metalness={0.82}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, isWaterFlowRunnerMode ? 0.22 : 1)}
              />
            </mesh>
            {/* Inlet nozzle neck connecting to Main Inlet Valve */}
            <mesh position={[-3.9, 0, -1.2]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[1.45, 1.45, 2.0, 20]} />
              <meshStandardMaterial
                color="#4E5E6E"
                roughness={0.42}
                metalness={0.82}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, isWaterFlowRunnerMode ? 0.22 : 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Stay Vanes (16 fixed structural pillars) */}
      <ComponentGroup {...shared('comp-stay-vanes')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <instancedMesh ref={stayVanesRef} args={[hydrofoilGeo, undefined, 16]}>
              <meshStandardMaterial
                color="#6A7A89"
                roughness={0.35}
                metalness={0.86}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
            {/* Upper & Lower Stay Rings */}
            {[0.52, -0.52].map((yPos) => (
              <mesh key={yPos} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.38, 0.14, 10, 32]} />
                <meshStandardMaterial
                  color="#6A7A89"
                  roughness={0.38}
                  metalness={0.84}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Guide Vanes / Wicket Gates (20 pivoting hydrofoils) */}
      <ComponentGroup {...shared('comp-guide-vanes')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <instancedMesh ref={guideVanesRef} args={[hydrofoilGeo, undefined, 20]}>
              <meshStandardMaterial
                color="#7E8F9F"
                roughness={0.3}
                metalness={0.88}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
            {/* Upper Regulating Ring */}
            <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.85, 0.11, 10, 32]} />
              <meshStandardMaterial
                color="#36C5D9"
                roughness={0.35}
                metalness={0.75}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Francis Runner (Crown, Nose Cone, Shroud Band) */}
      <ComponentGroup {...shared('comp-runner')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={runnerSpinRef}>
            {/* Upper Crown (hub) */}
            <mesh geometry={crownGeo} castShadow>
              <meshStandardMaterial
                color="#B9C6D2"
                roughness={0.22}
                metalness={0.93}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, isBladeInspection ? 0.25 : 1)}
              />
            </mesh>
            {/* Lower Shroud Band */}
            <mesh geometry={bandGeo}>
              <meshStandardMaterial
                color="#A4B4C3"
                roughness={0.25}
                metalness={0.9}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, isBladeInspection ? 0.18 : 1)}
              />
            </mesh>
            {/* Nose Cone */}
            <mesh geometry={noseGeo}>
              <meshStandardMaterial
                color="#B9C6D2"
                roughness={0.22}
                metalness={0.92}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Crown-to-shaft coupling bolts */}
            {Array.from({ length: 12 }).map((_, k) => {
              const ang = (k / 12) * Math.PI * 2;
              return (
                <mesh key={k} position={[Math.cos(ang) * 0.52, 0.68, Math.sin(ang) * 0.52]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
                  <meshStandardMaterial color="#6A7A89" metalness={0.9} roughness={0.3} />
                </mesh>
              );
            })}
          </group>
        )}
      </ComponentGroup>

      {/* 15 Double-Curved Twisted Francis Runner Blades */}
      <ComponentGroup {...shared('comp-runner-blades')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={bladesSpinRef}>
            {Array.from({ length: BLADE_COUNT }).map((_, idx) => {
              const rotY = (idx / BLADE_COUNT) * Math.PI * 2;
              const isHeroBlade = isBladeInspection && idx === 0;
              return (
                <group key={idx} rotation={[0, rotY, 0]}>
                  <mesh geometry={bladeGeo} castShadow>
                    <meshStandardMaterial
                      color={isHeroBlade ? '#36C5D9' : '#C9A86A'}
                      roughness={0.28}
                      metalness={0.85}
                      side={THREE.DoubleSide}
                      clippingPlanes={props.clippingPlanes}
                      {...matOpacityProps(st, isBladeInspection && !isHeroBlade ? 0.35 : 1)}
                    />
                  </mesh>
                  {isHeroBlade ? (
                    <>
                      <Html position={[1.75, 0.05, 0]} center style={{ pointerEvents: 'none' }}>
                        <div className="rounded border border-cyan-accent bg-canvas/95 px-1.5 py-0.5 text-[10px] font-mono text-cyan-accent whitespace-nowrap">
                          Leading Edge (Radial Inlet)
                        </div>
                      </Html>
                      <Html position={[0.55, -0.95, -0.62]} center style={{ pointerEvents: 'none' }}>
                        <div className="rounded border border-energy-accent bg-canvas/95 px-1.5 py-0.5 text-[10px] font-mono text-energy-accent whitespace-nowrap">
                          Trailing Edge (Axial Exit)
                        </div>
                      </Html>
                    </>
                  ) : null}
                </group>
              );
            })}
          </group>
        )}
      </ComponentGroup>

      {/* Forged Vertical Main Shaft */}
      <ComponentGroup {...shared('comp-main-shaft')} basePosition={[0, 5.2, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[0.38, 0.38, 9.6, 20]} />
              <meshStandardMaterial
                color="#9AA8B5"
                roughness={0.26}
                metalness={0.92}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Bolted Intermediate Coupling Flange */}
            <mesh position={[0, -0.8, 0]}>
              <cylinderGeometry args={[0.62, 0.62, 0.35, 20]} />
              <meshStandardMaterial
                color="#7E8F9F"
                roughness={0.32}
                metalness={0.88}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Expanding 90-Degree Elbow Draft Tube */}
      <ComponentGroup {...shared('comp-draft-tube')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Upper stainless throat cone */}
            <mesh position={[0, -1.5, 0]}>
              <cylinderGeometry args={[1.18, 1.48, 1.9, 24, 1, true]} />
              <meshStandardMaterial
                color="#586878"
                roughness={0.42}
                metalness={0.8}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh geometry={draftTubeGeo} castShadow>
              <meshStandardMaterial
                color="#6D7680"
                roughness={0.84}
                metalness={0.08}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>
    </group>
  );
}
