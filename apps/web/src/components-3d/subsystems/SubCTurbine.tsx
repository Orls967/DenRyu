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
 * Generates a double-curved radial-to-axial twisted Francis runner blade
 * using smooth parametric surface interpolation from leading edge (outer radial)
 * to trailing edge (inner axial exit).
 */
function buildTwistedFrancisBladeGeometry(): THREE.BufferGeometry {
  const uSteps = 12; // spanwise from crown (0) to band (1)
  const vSteps = 14; // streamwise from leading edge (0) to trailing edge (1)
  const thickness = 0.042;
  const positions: number[] = [];
  const indices: number[] = [];

  const evalMidSurface = (u: number, v: number): THREE.Vector3 => {
    // Radius decreases smoothly from outer radial edge (~1.42 m) to axial eye (~0.48..1.05 m)
    const rIn = 1.42 - 0.14 * u;
    const rOut = 0.42 + 0.65 * u;
    const r = THREE.MathUtils.lerp(rIn, rOut, Math.pow(v, 0.9));

    // Axial drop curves downward strongly near band and trailing edge
    const yIn = 0.36 - 0.42 * u;
    const yOut = -0.35 - 0.58 * u;
    const y = THREE.MathUtils.lerp(yIn, yOut, Math.pow(v, 1.25));

    // Angular sweep twists strongly between crown and band (hydrofoil warp)
    const theta = 0.48 * v + 0.32 * u * (1 - v) - 0.25 * Math.sin(v * Math.PI);
    return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
  };

  // Top & bottom blade skin
  for (const side of [-1, 1]) {
    for (let i = 0; i <= uSteps; i++) {
      const u = i / uSteps;
      for (let j = 0; j <= vSteps; j++) {
        const v = j / vSteps;
        const p = evalMidSurface(u, v);
        // Taper thickness cleanly at leading & trailing edges
        const edgeProfile = Math.sin(Math.max(0.08, Math.min(0.92, v)) * Math.PI);
        const offset = side * thickness * (0.35 + 0.65 * edgeProfile);
        positions.push(p.x + offset * 0.25, p.y + offset * 0.65, p.z + offset * 0.72);
      }
    }
  }

  const stride = vSteps + 1;
  const layerSize = (uSteps + 1) * (vSteps + 1);

  for (let i = 0; i < uSteps; i++) {
    for (let j = 0; j < vSteps; j++) {
      const a = i * stride + j;
      const b = (i + 1) * stride + j;
      const c = (i + 1) * stride + j + 1;
      const d = i * stride + j + 1;
      indices.push(a, b, d, b, c, d);

      const a2 = layerSize + a;
      const b2 = layerSize + b;
      const c2 = layerSize + c;
      const d2 = layerSize + d;
      indices.push(a2, d2, b2, b2, d2, c2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
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
            {/* Upper Crown */}
            <mesh position={[0, 0.42, 0]} castShadow>
              <cylinderGeometry args={[0.55, 1.38, 0.36, 28]} />
              <meshStandardMaterial
                color="#B6C4D1"
                roughness={0.24}
                metalness={0.92}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, isBladeInspection ? 0.25 : 1)}
              />
            </mesh>
            {/* Lower Shroud Band */}
            <mesh position={[0, -0.54, 0]}>
              <cylinderGeometry args={[1.44, 1.12, 0.56, 28, 1, true]} />
              <meshStandardMaterial
                color="#9EB0C0"
                roughness={0.26}
                metalness={0.9}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, isBladeInspection ? 0.25 : 1)}
              />
            </mesh>
            {/* Nose Cone */}
            <mesh position={[0, -0.1, 0]}>
              <coneGeometry args={[0.38, 0.78, 20]} />
              <meshStandardMaterial
                color="#B6C4D1"
                roughness={0.22}
                metalness={0.92}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* 15 Double-Curved Twisted Francis Runner Blades */}
      <ComponentGroup {...shared('comp-runner-blades')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={bladesSpinRef}>
            {Array.from({ length: 15 }).map((_, idx) => {
              const rotY = (idx / 15) * Math.PI * 2;
              const isHeroBlade = isBladeInspection && idx === 0;
              return (
                <group key={idx} rotation={[0, rotY, 0]}>
                  <mesh geometry={bladeGeo} castShadow>
                    <meshStandardMaterial
                      color={isHeroBlade ? '#36C5D9' : '#C4D2DF'}
                      roughness={0.22}
                      metalness={0.92}
                      side={THREE.DoubleSide}
                      clippingPlanes={props.clippingPlanes}
                      {...matOpacityProps(st, isBladeInspection && !isHeroBlade ? 0.35 : 1)}
                    />
                  </mesh>
                  {isHeroBlade ? (
                    <>
                      <Html position={[1.45, 0.25, 0]} center style={{ pointerEvents: 'none' }}>
                        <div className="rounded border border-cyan-accent bg-canvas/95 px-1.5 py-0.5 text-[10px] font-mono text-cyan-accent whitespace-nowrap">
                          Leading Edge (Radial Inlet)
                        </div>
                      </Html>
                      <Html position={[0.6, -0.75, 0.4]} center style={{ pointerEvents: 'none' }}>
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
