import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId } from '@/types/domain';

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

const POLE_COUNT = 24;
const SLOT_COUNT = 72;
/** Housing and stator are cut away on the +X/+Z quadrant facing the default cameras. */
const CUT_START = Math.PI / 2;
const CUT_LENGTH = Math.PI * 1.5;

/** Annular sector (in XZ) extruded along +Y, centred on y = 0. */
function annulusSector(rIn: number, rOut: number, height: number, start: number, length: number) {
  const shape = new THREE.Shape();
  const segs = 48;
  for (let i = 0; i <= segs; i++) {
    const a = start + (length * i) / segs;
    const x = Math.cos(a) * rOut;
    const y = Math.sin(a) * rOut;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = segs; i >= 0; i--) {
    const a = start + (length * i) / segs;
    shape.lineTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false, curveSegments: 1 });
  // Shape lives in XY; lay it into XZ with +Y up.
  geo.rotateX(Math.PI / 2);
  geo.translate(0, height / 2, 0);
  return geo;
}

function setInstances(
  mesh: THREE.InstancedMesh | null,
  count: number,
  place: (i: number, d: THREE.Object3D) => void
) {
  if (!mesh) return;
  const d = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    d.position.set(0, 0, 0);
    d.rotation.set(0, 0, 0);
    d.scale.set(1, 1, 1);
    place(i, d);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

export function SubDGenerator(
  props: Subsystem3DProps & {
    angularSpeedRadS: number;
    reducedMotion: boolean;
  }
) {
  const polesRef = useRef<THREE.InstancedMesh>(null);
  const poleShoesRef = useRef<THREE.InstancedMesh>(null);
  const spiderArmsRef = useRef<THREE.InstancedMesh>(null);
  const fieldCoilsRef = useRef<THREE.InstancedMesh>(null);
  const statorBarsRef = useRef<THREE.InstancedMesh>(null);
  const endTurnsRef = useRef<THREE.InstancedMesh>(null);
  const frameRibsRef = useRef<THREE.InstancedMesh>(null);
  const coolerFinsRef = useRef<THREE.InstancedMesh>(null);
  const rotorSpinRef = useRef<THREE.Group>(null);
  const fieldSpinRef = useRef<THREE.Group>(null);

  // Stator core: 6 lamination packets separated by radial ventilation ducts.
  const packetGeo = useMemo(() => annulusSector(2.5, 3.2, 0.3, CUT_START, CUT_LENGTH), []);
  const statorFrameGeo = useMemo(() => annulusSector(3.22, 3.36, 2.3, CUT_START, CUT_LENGTH), []);
  const housingGeo = useMemo(() => annulusSector(4.0, 4.35, 3.6, CUT_START, CUT_LENGTH), []);
  const deckGeo = useMemo(() => annulusSector(1.0, 4.35, 0.18, CUT_START, CUT_LENGTH), []);
  const bandGeo = useMemo(() => annulusSector(4.36, 4.4, 0.18, CUT_START, CUT_LENGTH), []);
  const rimGeo = useMemo(() => annulusSector(1.72, 1.98, 1.7, 0, Math.PI * 2), []);

  const coolerAngles = useMemo(
    () => [0.2, 1.25, 2.3, 3.35, 4.4].map((a) => a + CUT_START), // none inside the cut-away
    []
  );

  useLayoutEffect(() => {
    // Rotor: pole bodies, pole shoes, field coils
    setInstances(polesRef.current, POLE_COUNT, (i, d) => {
      const a = (i / POLE_COUNT) * Math.PI * 2;
      d.position.set(Math.cos(a) * 2.14, 0, Math.sin(a) * 2.14);
      d.rotation.set(0, -a, 0);
    });
    setInstances(poleShoesRef.current, POLE_COUNT, (i, d) => {
      const a = (i / POLE_COUNT) * Math.PI * 2;
      d.position.set(Math.cos(a) * 2.38, 0, Math.sin(a) * 2.38);
      d.rotation.set(0, -a, 0);
    });
    setInstances(fieldCoilsRef.current, POLE_COUNT, (i, d) => {
      const a = (i / POLE_COUNT) * Math.PI * 2;
      d.position.set(Math.cos(a) * 2.12, 0, Math.sin(a) * 2.12);
      d.rotation.set(0, -a, 0);
    });
    setInstances(spiderArmsRef.current, 8, (i, d) => {
      const a = (i / 8) * Math.PI * 2;
      d.position.set(Math.cos(a) * 1.15, 0, Math.sin(a) * 1.15);
      d.rotation.set(0, -a, 0);
    });
    // Stator: straight slot bars + diagonal end-turn basket (top & bottom)
    const inCut = (a: number) => {
      const t = (((a - CUT_START) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      return t > CUT_LENGTH;
    };
    setInstances(statorBarsRef.current, SLOT_COUNT, (i, d) => {
      const a = (i / SLOT_COUNT) * Math.PI * 2;
      d.position.set(Math.cos(a) * 2.56, 0, Math.sin(a) * 2.56);
      d.rotation.set(0, -a, 0);
      if (inCut(a)) d.scale.set(0, 0, 0);
    });
    setInstances(endTurnsRef.current, SLOT_COUNT * 2, (i, d) => {
      const slot = i % SLOT_COUNT;
      const top = i < SLOT_COUNT;
      const a = (slot / SLOT_COUNT) * Math.PI * 2 + (top ? 0.045 : -0.045);
      d.position.set(Math.cos(a) * 2.6, top ? 1.22 : -1.22, Math.sin(a) * 2.6);
      d.rotation.set(0, -a, 0);
      d.rotateX(top ? 0.95 : -0.95);
      if (inCut(a)) d.scale.set(0, 0, 0);
    });
    setInstances(frameRibsRef.current, 24, (i, d) => {
      const a = CUT_START + (CUT_LENGTH * (i + 0.5)) / 24;
      d.position.set(Math.cos(a) * 3.42, 0, Math.sin(a) * 3.42);
      d.rotation.set(0, -a, 0);
      if (inCut(a)) d.scale.set(0, 0, 0);
    });
    setInstances(coolerFinsRef.current, coolerAngles.length * 9, (i, d) => {
      const c = Math.floor(i / 9);
      const f = i % 9;
      const a = coolerAngles[c];
      const r = 3.72;
      const tangent = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a));
      const off = (f - 4) * 0.12;
      d.position.set(Math.cos(a) * r + tangent.x * off, 0, Math.sin(a) * r + tangent.z * off);
      d.rotation.set(0, -a, 0);
    });
  }, [coolerAngles]);

  useFrame((_, delta) => {
    if (props.reducedMotion) return;
    const visualOmega = Math.min(4.0, props.angularSpeedRadS * 0.11);
    const dTheta = visualOmega * delta;
    if (rotorSpinRef.current) rotorSpinRef.current.rotation.y -= dTheta;
    if (fieldSpinRef.current) fieldSpinRef.current.rotation.y -= dTheta;
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
  const clip = props.clippingPlanes;

  return (
    <group name="Subsystem_Generator">
      {/* Lower bracket: thrust/guide bearing pot on a 6-arm spider */}
      <ComponentGroup {...shared('comp-bearings')} basePosition={[0, 6.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[1.15, 1.25, 0.85, 32]} />
              <meshStandardMaterial color="#586776" roughness={0.4} metalness={0.75} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {/* Thrust runner collar & oil-level window */}
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.95, 0.95, 0.16, 32]} />
              <meshStandardMaterial color="#9AA8B5" roughness={0.25} metalness={0.9} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <mesh position={[1.18, 0, 0]}>
              <boxGeometry args={[0.06, 0.3, 0.4]} />
              <meshStandardMaterial color="#F5B942" emissive="#F5B942" emissiveIntensity={0.4} clippingPlanes={clip} />
            </mesh>
            {[0, 1, 2, 3, 4, 5].map((arm) => (
              <mesh
                key={arm}
                position={[Math.cos((arm * Math.PI) / 3) * 2.3, -0.05, Math.sin((arm * Math.PI) / 3) * 2.3]}
                rotation={[0, -(arm * Math.PI) / 3, 0]}
                castShadow
              >
                <boxGeometry args={[2.4, 0.5, 0.36]} />
                <meshStandardMaterial color="#4E5E6E" roughness={0.45} metalness={0.7} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* 24-pole salient-pole rotor: hub, 8-arm spider, laminated rim, pole bodies & shoes */}
      <ComponentGroup {...shared('comp-rotor')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={rotorSpinRef}>
            <mesh castShadow>
              <cylinderGeometry args={[0.62, 0.62, 2.0, 24]} />
              <meshStandardMaterial color="#8C9BA8" roughness={0.3} metalness={0.85} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <instancedMesh ref={spiderArmsRef} args={[undefined, undefined, 8]} castShadow>
              <boxGeometry args={[1.15, 1.5, 0.16]} />
              <meshStandardMaterial color="#6E7E8E" roughness={0.4} metalness={0.8} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
            <mesh geometry={rimGeo} castShadow>
              <meshStandardMaterial color="#7B8C9C" roughness={0.35} metalness={0.85} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <instancedMesh ref={polesRef} args={[undefined, undefined, POLE_COUNT]} castShadow>
              <boxGeometry args={[0.36, 1.6, 0.26]} />
              <meshStandardMaterial color="#6A7B8B" roughness={0.38} metalness={0.85} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
            <instancedMesh ref={poleShoesRef} args={[undefined, undefined, POLE_COUNT]}>
              <boxGeometry args={[0.1, 1.66, 0.5]} />
              <meshStandardMaterial color="#9AA8B5" roughness={0.3} metalness={0.9} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
          </group>
        )}
      </ComponentGroup>

      {/* DC field coils wound around every pole body */}
      <ComponentGroup {...shared('comp-field-winding')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={fieldSpinRef}>
            <instancedMesh ref={fieldCoilsRef} args={[undefined, undefined, POLE_COUNT]}>
              <boxGeometry args={[0.22, 1.36, 0.44]} />
              <meshStandardMaterial color="#C4773B" roughness={0.35} metalness={0.75} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
          </group>
        )}
      </ComponentGroup>

      {/* Laminated stator core (6 packets + vent ducts) inside a ribbed frame */}
      <ComponentGroup {...shared('comp-stator')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {[-0.875, -0.525, -0.175, 0.175, 0.525, 0.875].map((y, k) => (
              <mesh key={y} geometry={packetGeo} position={[0, y, 0]} castShadow receiveShadow>
                <meshStandardMaterial
                  color={k % 2 ? '#3E4B58' : '#46535F'}
                  roughness={0.55}
                  metalness={0.7}
                  clippingPlanes={clip}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            <mesh geometry={statorFrameGeo} castShadow>
              <meshStandardMaterial color="#2B3540" roughness={0.5} metalness={0.6} side={THREE.DoubleSide} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <instancedMesh ref={frameRibsRef} args={[undefined, undefined, 24]}>
              <boxGeometry args={[0.16, 2.3, 0.1]} />
              <meshStandardMaterial color="#3A4754" roughness={0.5} metalness={0.6} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
          </group>
        )}
      </ComponentGroup>

      {/* Copper armature winding: 72 slot bars + involute end-turn baskets */}
      <ComponentGroup {...shared('comp-stator-winding')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <instancedMesh ref={statorBarsRef} args={[undefined, undefined, SLOT_COUNT]}>
              <boxGeometry args={[0.1, 2.2, 0.07]} />
              <meshStandardMaterial color="#C27A3E" roughness={0.3} metalness={0.8} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
            <instancedMesh ref={endTurnsRef} args={[undefined, undefined, SLOT_COUNT * 2]}>
              <boxGeometry args={[0.1, 0.55, 0.07]} />
              <meshStandardMaterial color="#B86B35" roughness={0.35} metalness={0.75} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
            {[1.42, -1.42].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, CUT_START]}>
                <torusGeometry args={[2.62, 0.05, 6, 72, CUT_LENGTH]} />
                <meshStandardMaterial color="#8C5A2E" roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Closed-loop air-to-water coolers: finned packs with cold/warm water headers */}
      <ComponentGroup {...shared('comp-cooling-system')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <instancedMesh ref={coolerFinsRef} args={[undefined, undefined, coolerAngles.length * 9]}>
              <boxGeometry args={[0.42, 1.7, 0.03]} />
              <meshStandardMaterial color="#6C8BA6" roughness={0.35} metalness={0.8} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </instancedMesh>
            {coolerAngles.map((a) => (
              <group key={a} position={[Math.cos(a) * 3.72, 0, Math.sin(a) * 3.72]} rotation={[0, -a, 0]}>
                <mesh>
                  <boxGeometry args={[0.46, 1.9, 1.16]} />
                  <meshStandardMaterial color="#2E4052" roughness={0.6} metalness={0.4} wireframe clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                {[
                  [0.82, '#3FA6E6'],
                  [-0.82, '#E07B39'],
                ].map(([y, color]) => (
                  <mesh key={y as number} position={[0.12, y as number, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.09, 0.09, 1.3, 10]} />
                    <meshStandardMaterial color={color as string} roughness={0.4} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Static excitation: slip rings + brush gear on the shaft, AVR/thyristor cubicles on the floor */}
      <ComponentGroup {...shared('comp-excitation-system')} basePosition={[0, 12.1, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 1.5, 16]} />
              <meshStandardMaterial color="#9AA8B5" roughness={0.25} metalness={0.9} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {[0.15, 0.55, 0.95].map((y) => (
              <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.42, 0.07, 8, 24]} />
                <meshStandardMaterial color="#C4773B" roughness={0.3} metalness={0.85} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
              </mesh>
            ))}
            {[0, 1, 2, 3].map((k) => {
              const a = (k / 4) * Math.PI * 2 + 0.4;
              return (
                <mesh key={k} position={[Math.cos(a) * 0.62, 0.55, Math.sin(a) * 0.62]} rotation={[0, -a, 0]}>
                  <boxGeometry args={[0.18, 1.1, 0.12]} />
                  <meshStandardMaterial color="#36C5D9" roughness={0.4} metalness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
              );
            })}
            {/* Brush-gear canopy */}
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.85, 0.85, 0.12, 24]} />
              <meshStandardMaterial color="#2B3540" roughness={0.5} metalness={0.6} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {/* AVR + thyristor bridge cubicles standing on the generator floor */}
            {[-1.0, 0, 1.0].map((x, k) => (
              <group key={x} position={[x, -2.95, -5.2]}>
                <mesh castShadow>
                  <boxGeometry args={[0.95, 2.2, 0.8]} />
                  <meshStandardMaterial color="#2A3644" roughness={0.6} metalness={0.4} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                <mesh position={[0, 0.2, 0.41]}>
                  <boxGeometry args={[0.8, 1.6, 0.02]} />
                  <meshStandardMaterial color="#344456" roughness={0.5} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                </mesh>
                <mesh position={[-0.25, 0.85, 0.43]}>
                  <boxGeometry args={[0.08, 0.08, 0.02]} />
                  <meshStandardMaterial color={k === 1 ? '#F5B942' : '#32C786'} emissive={k === 1 ? '#F5B942' : '#32C786'} emissiveIntensity={1} />
                </mesh>
                {[0.55, 0.35, 0.15].map((y) => (
                  <mesh key={y} position={[0.1, y - 0.9, 0.42]}>
                    <boxGeometry args={[0.5, 0.04, 0.02]} />
                    <meshStandardMaterial color="#1B242E" clippingPlanes={clip} {...matOpacityProps(st, 1)} />
                  </mesh>
                ))}
              </group>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Concrete generator barrel + upper deck, cut away to expose the machine */}
      <ComponentGroup {...shared('comp-generator-housing')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh geometry={housingGeo} castShadow receiveShadow>
              <meshStandardMaterial color="#5E6A76" roughness={0.85} metalness={0.05} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            <mesh geometry={deckGeo} position={[0, 1.89, 0]} receiveShadow>
              <meshStandardMaterial color="#374554" roughness={0.7} metalness={0.3} clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
            {/* Cyan safety band on the barrel */}
            <mesh geometry={bandGeo} position={[0, 1.2, 0]}>
              <meshStandardMaterial color="#36C5D9" clippingPlanes={clip} {...matOpacityProps(st, 1)} />
            </mesh>
          </group>
        )}
      </ComponentGroup>
    </group>
  );
}
