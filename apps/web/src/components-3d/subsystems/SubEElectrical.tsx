import { useMemo } from 'react';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId } from '@/types/domain';
import {
  Insulator,
  SegmentLattice,
  latticeTowerSegments,
  vec3,
  type Segment,
} from '@/components-3d/subsystems/structural';

const PHASES = [-2.2, 0, 2.2];
const STEEL = '#7D8A97';

export function SubEElectrical(props: Subsystem3DProps) {
  const catenaryCurves = useMemo(() => {
    return [-1.6, 0, 1.6].map((zOff) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(28, 13.5, -12 + zOff),
        new THREE.Vector3(34.5, 17.5, -12 + zOff),
        new THREE.Vector3(46, 15.2, -12 + zOff),
        new THREE.Vector3(58, 17.2, -12 + zOff),
      ]);
      return new THREE.TubeGeometry(curve, 32, 0.07, 6, false);
    });
  }, []);

  // Onward grid spans to two receding towers (decorative continuation of the line).
  const onwardCurves = useMemo(() => {
    const spans: THREE.TubeGeometry[] = [];
    const towers = [
      [58.5, 17.2],
      [76, 17.2],
      [94, 17.2],
    ];
    for (let k = 0; k < towers.length - 1; k++) {
      for (const zOff of [-1.6, 0, 1.6]) {
        const [x0, y0] = towers[k];
        const [x1, y1] = towers[k + 1];
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(x0 - 58.5, y0 - 11.5, zOff),
          new THREE.Vector3((x0 + x1) / 2 - 58.5, (y0 + y1) / 2 - 11.5 - 2.2, zOff),
          new THREE.Vector3(x1 - 58.5, y1 - 11.5, zOff),
        ]);
        spans.push(new THREE.TubeGeometry(curve, 20, 0.06, 6, false));
      }
    }
    return spans;
  }, []);

  const pylonSegments = useMemo(
    () =>
      latticeTowerSegments({
        base: 1.7,
        top: 0.45,
        height: 13.2,
        levels: 7,
        arms: [{ y: 12.0, halfLength: 2.4 }],
        origin: vec3(34.5, 6.1, -12),
      }),
    []
  );

  const gridTowerSegments = useMemo(
    () => [
      ...latticeTowerSegments({
        base: 1.6,
        top: 0.45,
        height: 12.8,
        levels: 7,
        arms: [{ y: 11.7, halfLength: 2.4 }],
        origin: vec3(0, -5.4, 0),
      }),
      ...latticeTowerSegments({
        base: 1.4,
        top: 0.4,
        height: 12.4,
        levels: 6,
        arms: [{ y: 11.7, halfLength: 2.4 }],
        origin: vec3(17.5, -5.4, 0),
      }),
      ...latticeTowerSegments({
        base: 1.4,
        top: 0.4,
        height: 12.4,
        levels: 6,
        arms: [{ y: 11.7, halfLength: 2.4 }],
        origin: vec3(35.5, -5.4, 0),
      }),
    ],
    []
  );

  // Switchyard steel: gantry portal (two lattice columns + truss beam), equipment
  // support posts and the perimeter fence.
  const switchyardSteel = useMemo(() => {
    const segs: Segment[] = [];
    for (const z of [-4.4, 4.4]) {
      segs.push(
        ...latticeTowerSegments({ base: 0.45, top: 0.35, height: 7.0, levels: 5, origin: vec3(2.5, 0, z) })
      );
    }
    // Truss crossbeam (two chords + diagonals)
    const y0 = 6.8;
    const y1 = 7.6;
    for (const x of [2.15, 2.85]) {
      segs.push([vec3(x, y0, -4.4), vec3(x, y0, 4.4)]);
      segs.push([vec3(x, y1, -4.4), vec3(x, y1, 4.4)]);
      for (let z = -4.4; z < 4.4; z += 1.1) {
        segs.push([vec3(x, y0, z), vec3(x, y1, z + 1.1)]);
        segs.push([vec3(x, y0, z), vec3(x, y1, z)]);
      }
    }
    // Shield-wire peaks
    for (const z of [-4.4, 4.4]) segs.push([vec3(2.5, 8.4, z), vec3(2.5, 10.2, z)]);
    // Equipment support posts (per phase)
    for (const z of PHASES) {
      for (const x of [-4.6, -2.6, -1.0, -0.2, 1.0]) segs.push([vec3(x, 0, z), vec3(x, 2.2, z)]);
    }
    // Perimeter fence: posts + top rail
    const fx = 6.3;
    const fz = 4.85;
    const corners = [vec3(-fx, 0, -fz), vec3(fx, 0, -fz), vec3(fx, 0, fz), vec3(-fx, 0, fz)];
    for (let i = 0; i < 4; i++) {
      const a = corners[i];
      const b = corners[(i + 1) % 4];
      const len = a.distanceTo(b);
      const n = Math.max(2, Math.round(len / 1.6));
      for (let k = 0; k < n; k++) {
        const p = a.clone().lerp(b, k / n);
        segs.push([p, p.clone().setY(1.8)]);
      }
      segs.push([a.clone().setY(1.8), b.clone().setY(1.8)]);
      segs.push([a.clone().setY(0.9), b.clone().setY(0.9)]);
    }
    return segs;
  }, []);

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
  const clip = props.clippingPlanes;

  return (
    <group name="Subsystem_Electrical_Transmission">
      {/* Generator terminal box with three line-side bushings and current transformers */}
      <ComponentGroup {...shared('comp-generator-terminal')} basePosition={[3.9, 9.6, -2.2]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh castShadow>
              <boxGeometry args={[1.4, 1.6, 2.4]} />
              <meshStandardMaterial color="#364454" roughness={0.5} metalness={0.6} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {[-0.7, 0, 0.7].map((zOff) => (
              <group key={zOff}>
                <Insulator position={[0.7, 0.2, zOff]} rotation={[0, 0, -Math.PI / 2]} height={0.9} radius={0.1} sheds={4} clippingPlanes={clip} st={st} />
                <mesh position={[0.95, 0.2, zOff]} rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.2, 0.06, 8, 16]} />
                  <meshStandardMaterial color="#2B3540" metalness={0.6} roughness={0.4} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
              </group>
            ))}
            <mesh position={[-0.71, 0.3, 0]}>
              <boxGeometry args={[0.02, 0.5, 0.9]} />
              <meshStandardMaterial color="#F5B942" clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Isolated-phase bus ducts on support frames */}
      <ComponentGroup {...shared('comp-busbar')} basePosition={[8.6, 9.8, -6.4]}>
        {(st: ComponentGroupRenderState) => (
          <group rotation={[0, 0.68, 0]}>
            {[-0.85, 0, 0.85].map((zOff) => (
              <group key={zOff}>
                <mesh position={[0, 0, zOff]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.26, 0.26, 10.5, 18]} />
                  <meshStandardMaterial color="#A4B0BB" roughness={0.3} metalness={0.85} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {[-4.5, -1.5, 1.5, 4.5].map((x) => (
                  <mesh key={x} position={[x, 0, zOff]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.31, 0.31, 0.12, 18]} />
                    <meshStandardMaterial color="#6E7C89" metalness={0.8} roughness={0.35} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
              </group>
            ))}
            {[-3, 0, 3].map((x) => (
              <group key={x} position={[x, 0, 0]}>
                <mesh position={[0, -0.42, 0]}>
                  <boxGeometry args={[0.18, 0.14, 2.4]} />
                  <meshStandardMaterial color="#4E5E6E" metalness={0.6} roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {[-1.1, 1.1].map((z) => (
                  <mesh key={z} position={[0, -1.1, z]}>
                    <boxGeometry args={[0.14, 1.4, 0.14]} />
                    <meshStandardMaterial color="#4E5E6E" metalness={0.6} roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Generator circuit breaker: 3 horizontal SF6 pole tanks + operating mechanisms */}
      <ComponentGroup {...shared('comp-circuit-breaker')} basePosition={[8.6, 9.5, -6.4]}>
        {(st: ComponentGroupRenderState) => (
          <group rotation={[0, 0.68, 0]}>
            <mesh position={[0, -1.0, 0]} castShadow>
              <boxGeometry args={[2.2, 0.5, 3.0]} />
              <meshStandardMaterial color="#2B3540" roughness={0.6} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {[-0.85, 0, 0.85].map((zOff) => (
              <group key={zOff} position={[0, 0.3, zOff]}>
                <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.36, 0.36, 2.0, 18]} />
                  <meshStandardMaterial color="#F5B942" roughness={0.45} metalness={0.4} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {[-1.0, 1.0].map((x) => (
                  <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.42, 0.42, 0.1, 18]} />
                    <meshStandardMaterial color="#6E7C89" metalness={0.8} roughness={0.35} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
                <mesh position={[0, -0.7, 0]}>
                  <boxGeometry args={[0.6, 0.5, 0.45]} />
                  <meshStandardMaterial color="#384858" roughness={0.6} metalness={0.4} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
              </group>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Generator step-up transformer (GSU) */}
      <ComponentGroup {...shared('comp-step-up-transformer')} basePosition={[14.5, 8.2, -11.5]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Oil containment bund */}
            <mesh position={[0, -2.0, 0]} receiveShadow>
              <boxGeometry args={[7.2, 0.6, 6.8]} />
              <meshStandardMaterial color="#5B6773" roughness={0.9} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <mesh position={[0, -1.62, 0]}>
              <boxGeometry args={[6.6, 0.16, 6.2]} />
              <meshStandardMaterial color="#3A4652" roughness={1} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {/* Main tank + horizontal stiffeners */}
            <mesh castShadow>
              <boxGeometry args={[4.4, 3.6, 3.2]} />
              <meshStandardMaterial color="#4A5866" roughness={0.55} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {[-1.1, 0.1, 1.3].map((y) => (
              <mesh key={y} position={[0, y, 0]}>
                <boxGeometry args={[4.56, 0.12, 3.36]} />
                <meshStandardMaterial color="#3A4654" roughness={0.6} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
            <mesh position={[0, 1.88, 0]}>
              <boxGeometry args={[4.6, 0.16, 3.4]} />
              <meshStandardMaterial color="#3A4654" roughness={0.6} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {/* Core & windings (visible with section cut) */}
            {[-1.1, 0, 1.1].map((xOff) => (
              <mesh key={xOff} position={[xOff, 0, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 2.4, 14]} />
                <meshStandardMaterial color="#B86B35" roughness={0.4} metalness={0.7} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
            {/* Radiator banks (fin plates) with fans */}
            {[-1.25, 1.25].map((xOff) => (
              <group key={xOff} position={[xOff, -0.1, 2.15]}>
                {Array.from({ length: 9 }).map((_, k) => (
                  <mesh key={k} position={[(k - 4) * 0.2, 0, 0]} castShadow>
                    <boxGeometry args={[0.05, 2.8, 0.9]} />
                    <meshStandardMaterial color="#5C6B79" roughness={0.5} metalness={0.6} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
                {[1.45, -1.45].map((y) => (
                  <mesh key={y} position={[0, y, -0.55]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.1, 0.1, 1.9, 10]} />
                    <meshStandardMaterial color="#4E5E6E" metalness={0.6} roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
                <mesh position={[0, -1.65, 0]} rotation={[0, 0, 0]}>
                  <cylinderGeometry args={[0.5, 0.5, 0.25, 18]} />
                  <meshStandardMaterial color="#2B3540" metalness={0.5} roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
              </group>
            ))}
            {/* Conservator on brackets + Buchholz pipe */}
            <mesh position={[0, 3.0, -1.1]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 3.4, 18]} />
              <meshStandardMaterial color="#586878" roughness={0.5} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {[-1.2, 1.2].map((x) => (
              <mesh key={x} position={[x, 2.35, -1.1]}>
                <boxGeometry args={[0.14, 0.9, 0.14]} />
                <meshStandardMaterial color="#4E5E6E" clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
            <mesh position={[0.6, 2.2, -0.7]} rotation={[0.6, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.0, 8]} />
              <meshStandardMaterial color="#4E5E6E" clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {/* HV bushings (to switchyard) and LV bushings (from bus ducts) */}
            {[-1.3, 0, 1.3].map((xOff) => (
              <Insulator key={`hv${xOff}`} position={[xOff, 1.95, 0.5]} rotation={[0.12, 0, 0]} height={2.4} radius={0.13} sheds={9} clippingPlanes={clip} st={st} />
            ))}
            {[-0.8, 0, 0.8].map((zOff) => (
              <Insulator key={`lv${zOff}`} position={[-2.2, 0.9, zOff]} rotation={[0, 0, Math.PI / 2]} height={0.8} radius={0.12} sheds={3} clippingPlanes={clip} st={st} />
            ))}
            {/* Rating plate */}
            <mesh position={[0, 0.6, -1.62]}>
              <boxGeometry args={[0.7, 0.45, 0.02]} />
              <meshStandardMaterial color="#C9D3DC" clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Outdoor AIS switchyard bay: arresters, breakers, disconnectors, CTs, rigid bus, gantry, fence */}
      <ComponentGroup {...shared('comp-switchyard')} basePosition={[25.5, 6.4, -12]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh position={[0, -0.2, 0]} receiveShadow>
              <boxGeometry args={[13, 0.5, 10]} />
              <meshStandardMaterial color="#34404C" roughness={1} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <SegmentLattice segments={switchyardSteel} thickness={0.1} color={STEEL} clippingPlanes={clip} st={st} />
            {PHASES.map((z) => (
              <group key={z}>
                {/* Surge arrester with grading ring */}
                <Insulator position={[-4.6, 2.2, z]} height={1.8} radius={0.14} sheds={10} color="#8E9AA6" clippingPlanes={clip} st={st} />
                <mesh position={[-4.6, 3.9, z]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.32, 0.03, 6, 20]} />
                  <meshStandardMaterial color="#C9D3DC" metalness={0.7} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {/* Live-tank SF6 circuit breaker */}
                <mesh position={[-2.6, 2.45, z]}>
                  <boxGeometry args={[0.5, 0.5, 0.5]} />
                  <meshStandardMaterial color="#384858" metalness={0.5} roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                <Insulator position={[-2.6, 2.7, z]} height={1.6} radius={0.17} sheds={8} clippingPlanes={clip} st={st} />
                <mesh position={[-2.6, 4.45, z]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.2, 0.2, 1.0, 14]} />
                  <meshStandardMaterial color="#9AA8B5" metalness={0.8} roughness={0.3} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {/* Centre-break disconnector */}
                {[-1.0, -0.2].map((x) => (
                  <Insulator key={x} position={[x, 2.2, z]} height={1.6} radius={0.1} sheds={7} clippingPlanes={clip} st={st} />
                ))}
                <mesh position={[-0.6, 3.85, z]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, 0.9, 8]} />
                  <meshStandardMaterial color="#C9D3DC" metalness={0.8} roughness={0.3} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {/* Current transformer: insulator + head tank */}
                <Insulator position={[1.0, 2.2, z]} height={1.6} radius={0.13} sheds={8} clippingPlanes={clip} st={st} />
                <mesh position={[1.0, 4.05, z]}>
                  <sphereGeometry args={[0.32, 16, 12]} />
                  <meshStandardMaterial color="#5C6B79" metalness={0.6} roughness={0.4} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {/* Rigid aluminium tube bus between equipment, then drop to the gantry */}
                <mesh position={[-1.8, 4.1, z]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.06, 0.06, 5.6, 8]} />
                  <meshStandardMaterial color="#C9D3DC" metalness={0.85} roughness={0.25} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                <mesh
                  position={[1.75, 5.6, z]}
                  rotation={[0, 0, -Math.atan2(1.5, 3.0)]}
                >
                  <cylinderGeometry args={[0.04, 0.04, 3.4, 6]} />
                  <meshStandardMaterial color="#9AA6B2" metalness={0.8} roughness={0.3} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {/* Strain insulator string on the gantry */}
                <Insulator position={[2.5, 6.8, z]} rotation={[Math.PI, 0, 0]} height={0.9} radius={0.08} sheds={6} clippingPlanes={clip} st={st} />
              </group>
            ))}
            {/* Relay / control kiosk */}
            <mesh position={[-5.2, 0.85, -3.8]} castShadow>
              <boxGeometry args={[1.6, 1.7, 1.2]} />
              <meshStandardMaterial color="#2A3644" roughness={0.6} metalness={0.4} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <mesh position={[-5.2, 1.4, -3.19]}>
              <boxGeometry args={[0.1, 0.1, 0.02]} />
              <meshStandardMaterial color="#32C786" emissive="#32C786" emissiveIntensity={1} />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Overhead ACSR line on a lattice suspension tower */}
      <ComponentGroup {...shared('comp-transmission-line')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <SegmentLattice segments={pylonSegments} thickness={0.12} color={STEEL} clippingPlanes={clip} st={st} />
            {[-1.6, 0, 1.6].map((zOff) => (
              <Insulator
                key={zOff}
                position={[34.5, 18.1, -12 + zOff]}
                rotation={[Math.PI, 0, 0]}
                height={0.6}
                radius={0.08}
                sheds={6}
                clippingPlanes={clip}
                st={st}
              />
            ))}
            {catenaryCurves.map((geo, idx) => (
              <mesh key={idx} geometry={geo}>
                <meshStandardMaterial color="#9AA6B2" roughness={0.35} metalness={0.8} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
            {/* Tower footing */}
            <mesh position={[34.5, 6.2, -12]} receiveShadow>
              <boxGeometry args={[4.2, 0.3, 4.2]} />
              <meshStandardMaterial color="#3A4652" roughness={1} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Grid interconnection: dead-end tower and the line continuing to the wider network */}
      <ComponentGroup {...shared('comp-electrical-grid')} basePosition={[58.5, 11.5, -12]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh position={[0, -5.25, 0]} receiveShadow>
              <boxGeometry args={[4.2, 0.3, 4.2]} />
              <meshStandardMaterial color="#3A4652" roughness={1} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <SegmentLattice segments={gridTowerSegments} thickness={0.12} color="#8A97A4" clippingPlanes={clip} st={st} />
            {[0, 17.5, 35.5].flatMap((x) =>
              [-1.6, 0, 1.6].map((zOff) => (
                <Insulator
                  key={`${x}:${zOff}`}
                  position={[x, 6.3, zOff]}
                  rotation={[Math.PI, 0, 0]}
                  height={0.6}
                  radius={0.08}
                  sheds={6}
                  clippingPlanes={clip}
                  st={st}
                />
              ))
            )}
            {onwardCurves.map((geo, idx) => (
              <mesh key={idx} geometry={geo}>
                <meshStandardMaterial color="#9AA6B2" roughness={0.35} metalness={0.8} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
            {/* Grid beacon */}
            <mesh position={[0, 8.9, 0]}>
              <sphereGeometry args={[0.28, 12, 10]} />
              <meshStandardMaterial color="#32C786" emissive="#32C786" emissiveIntensity={1.1} />
            </mesh>
          </group>
        )}
      </ComponentGroup>
    </group>
  );
}
