import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { ComponentId } from '@/types/domain';

export interface Subsystem3DProps {
  explodeFactor: number;
  hiddenIds: Record<string, boolean>;
  isolatedId: ComponentId | null;
  selectedId: ComponentId | null;
  hoveredId: ComponentId | null;
  highlightedIds: ComponentId[];
  transparentIds: ComponentId[];
  showLabels: boolean;
  clippingPlanes: THREE.Plane[];
  onSelect?: (id: ComponentId) => void;
  onHover?: (id: ComponentId | null) => void;
}

/* ------------------------------------------------------------------ */
/* Concrete gravity dam profile (XY plane, extruded along Z)           */
/* Upstream face keeps the intake/trash-rack seat at x ≈ -33.5, y 62.  */
/* ------------------------------------------------------------------ */
const DAM_HALF_WIDTH = 70;
const WATER_LEVEL_Y = 86;
const CREST_Y = 92;
const UP_HEEL: [number, number] = [-44, -6];
const UP_FACE_KNEE: [number, number] = [-33.5, 56];
const CREST_UP_X = -33.5;
const CREST_DOWN_X = -25.5;
const DOWN_KNEE_Y = 84;
const TOE: [number, number] = [-11, -6];

/** X coordinate on the sloped downstream face at height y. */
export function damDownstreamFaceX(y: number): number {
  const t = (y - TOE[1]) / (DOWN_KNEE_Y - TOE[1]);
  return THREE.MathUtils.lerp(TOE[0], CREST_DOWN_X, THREE.MathUtils.clamp(t, 0, 1));
}

const SPILLWAY_Z0 = 13;
const SPILLWAY_Z1 = 25;
const SPILLWAY_CREST_Y = 87;

function buildDamGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(UP_HEEL[0], UP_HEEL[1]);
  shape.lineTo(TOE[0], TOE[1]);
  shape.lineTo(CREST_DOWN_X, DOWN_KNEE_Y);
  shape.lineTo(CREST_DOWN_X, CREST_Y);
  shape.lineTo(CREST_UP_X, CREST_Y);
  shape.lineTo(UP_FACE_KNEE[0], UP_FACE_KNEE[1]);
  shape.lineTo(UP_HEEL[0], UP_HEEL[1]);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: DAM_HALF_WIDTH * 2, bevelEnabled: false });
  geo.translate(0, 0, -DAM_HALF_WIDTH);
  return geo;
}

function buildReservoirGeometry(): THREE.BufferGeometry {
  // Water body wedged against the upstream face, open towards the upstream valley.
  const shape = new THREE.Shape();
  shape.moveTo(-104, -6);
  shape.lineTo(UP_HEEL[0] - 0.2, -6);
  shape.lineTo(UP_FACE_KNEE[0] - 0.2, UP_FACE_KNEE[1]);
  shape.lineTo(CREST_UP_X - 0.2, WATER_LEVEL_Y);
  shape.lineTo(-104, WATER_LEVEL_Y);
  shape.lineTo(-104, -6);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: DAM_HALF_WIDTH * 2 - 0.4,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -DAM_HALF_WIDTH + 0.2);
  return geo;
}

/** Ogee crest + chute that hugs the downstream face, ending in a flip bucket. */
function buildSpillwayChuteGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const lift = 0.6; // slab thickness proud of the dam face
  // Ogee crest profile
  shape.moveTo(CREST_UP_X + 1, SPILLWAY_CREST_Y - 3);
  shape.quadraticCurveTo(CREST_UP_X + 3, SPILLWAY_CREST_Y + 0.6, CREST_DOWN_X, SPILLWAY_CREST_Y - 1.2);
  // Chute down the downstream face
  for (let y = SPILLWAY_CREST_Y - 6; y >= 2; y -= 6) {
    shape.lineTo(damDownstreamFaceX(y) + lift, y);
  }
  // Flip bucket lip at the toe
  shape.quadraticCurveTo(TOE[0] + 1.5, -5, TOE[0] + 6.5, -1.2);
  shape.lineTo(TOE[0] + 6.5, -3.4);
  shape.quadraticCurveTo(TOE[0] + 1, -6.2, damDownstreamFaceX(2) - 0.4, 2);
  shape.lineTo(CREST_UP_X + 1, SPILLWAY_CREST_Y - 3);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: SPILLWAY_Z1 - SPILLWAY_Z0,
    bevelEnabled: false,
  });
  geo.translate(0, 0, SPILLWAY_Z0);
  return geo;
}

function buildSpillwayWallGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(CREST_UP_X, CREST_Y);
  shape.lineTo(CREST_DOWN_X + 0.5, CREST_Y);
  for (let y = DOWN_KNEE_Y; y >= -4; y -= 8) shape.lineTo(damDownstreamFaceX(y) + 2.6, y + 2.2);
  shape.lineTo(TOE[0] + 7, -0.2);
  shape.lineTo(TOE[0] + 7, -6);
  shape.lineTo(TOE[0], -6);
  shape.lineTo(CREST_UP_X, SPILLWAY_CREST_Y - 4);
  shape.lineTo(CREST_UP_X, CREST_Y);
  return new THREE.ExtrudeGeometry(shape, { depth: 0.9, bevelEnabled: false });
}

/** Valley backdrop: rock abutments behind the plant so the dam reads as spanning a gorge. */
function buildValleyGeometry(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(200, 60, 80, 24);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const zLocal = pos.getZ(i); // -30 (far) .. +30 (near)
    const depthT = THREE.MathUtils.clamp((30 - zLocal) / 60, 0, 1);
    // Ridge height: tall around the dam, falling away downstream.
    const ridge = x < -20 ? 104 : THREE.MathUtils.lerp(104, 26, THREE.MathUtils.clamp((x + 20) / 110, 0, 1));
    const noise =
      Math.sin(x * 0.11) * 3.2 + Math.sin(x * 0.27 + zLocal * 0.3) * 1.6 + Math.cos(zLocal * 0.21) * 2.2;
    const h = -7.9 + (ridge + noise) * Math.pow(depthT, 0.7);
    pos.setY(i, h);
  }
  geo.translate(-5, 0, -DAM_HALF_WIDTH - 32);
  geo.computeVertexNormals();
  return geo;
}

const noRaycast = () => null;

export function SubAReservoirDam(props: Subsystem3DProps) {
  const trashBarsRef = useRef<THREE.InstancedMesh>(null);
  const jointsRef = useRef<THREE.InstancedMesh>(null);

  const damGeo = useMemo(() => buildDamGeometry(), []);
  const reservoirGeo = useMemo(() => buildReservoirGeometry(), []);
  const chuteGeo = useMemo(() => buildSpillwayChuteGeometry(), []);
  const spillWallGeo = useMemo(() => buildSpillwayWallGeometry(), []);
  const valleyGeo = useMemo(() => buildValleyGeometry(), []);

  // Horizontal lift joints on the downstream face (every 6 m) + monolith joints (every 8 m).
  const faceAngle = Math.atan2(CREST_DOWN_X - TOE[0], DOWN_KNEE_Y - TOE[1]);
  const liftYs = useMemo(() => {
    const ys: number[] = [];
    for (let y = 0; y < DOWN_KNEE_Y; y += 6) ys.push(y);
    return ys;
  }, []);
  const monolithZs = useMemo(() => {
    const zs: number[] = [];
    for (let z = -DAM_HALF_WIDTH + 8; z < DAM_HALF_WIDTH; z += 8) {
      if (z > SPILLWAY_Z0 - 1 && z < SPILLWAY_Z1 + 1) continue;
      zs.push(z);
    }
    return zs;
  }, []);
  const jointCount = liftYs.length + monolithZs.length;

  useLayoutEffect(() => {
    const mesh = trashBarsRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 12; i++) {
      dummy.position.set(0, 0, -2.2 + i * 0.4);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  useLayoutEffect(() => {
    const mesh = jointsRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    let i = 0;
    for (const y of liftYs) {
      dummy.position.set(damDownstreamFaceX(y) + 0.06, y, 0);
      dummy.rotation.set(0, 0, faceAngle);
      dummy.scale.set(1, 1, DAM_HALF_WIDTH * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    const midY = (TOE[1] + DOWN_KNEE_Y) / 2;
    const faceLen = Math.hypot(CREST_DOWN_X - TOE[0], DOWN_KNEE_Y - TOE[1]);
    for (const z of monolithZs) {
      dummy.position.set(damDownstreamFaceX(midY) + 0.06, midY, z);
      dummy.rotation.set(0, 0, -faceAngle);
      dummy.scale.set(1, faceLen / 0.12, 0.12 / 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [liftYs, monolithZs, faceAngle]);

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

  return (
    <group name="Subsystem_Reservoir_Dam">
      {/* Decorative valley backdrop (not selectable) */}
      <mesh geometry={valleyGeo} receiveShadow raycast={noRaycast} userData={{ isDecorative: true }}>
        <meshStandardMaterial color="#26313B" roughness={0.97} metalness={0} flatShading />
      </mesh>

      {/* Reservoir water body (group origin kept at the historical label anchor) */}
      <ComponentGroup {...shared('comp-reservoir')} basePosition={[-58, 39, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group position={[58, -39, 0]}>
            <mesh geometry={reservoirGeo} renderOrder={2}>
              <meshStandardMaterial
                color="#1F6FB8"
                roughness={0.2}
                metalness={0.05}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.34)}
                emissiveIntensity={st.emissiveIntensity * 0.35}
              />
            </mesh>
            {/* Reflective free surface */}
            <mesh
              position={[(-104 + CREST_UP_X) / 2, WATER_LEVEL_Y + 0.02, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              renderOrder={3}
            >
              <planeGeometry args={[104 + CREST_UP_X - 0.4, DAM_HALF_WIDTH * 2 - 0.4]} />
              <meshStandardMaterial
                color="#2F8FD0"
                roughness={0.35}
                metalness={0.1}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.78)}
                emissiveIntensity={st.emissiveIntensity * 0.35}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Concrete Gravity Dam */}
      <ComponentGroup {...shared('comp-dam')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh geometry={damGeo} castShadow receiveShadow>
              <meshStandardMaterial
                color="#8A939C"
                roughness={0.9}
                metalness={0.02}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Lift & monolith joints */}
            <instancedMesh ref={jointsRef} args={[undefined, undefined, jointCount]} raycast={noRaycast}>
              <boxGeometry args={[0.12, 0.12, 1]} />
              <meshStandardMaterial
                color="#59626B"
                roughness={1}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
            {/* Crest road deck with parapets */}
            <mesh position={[(CREST_UP_X + CREST_DOWN_X) / 2, CREST_Y + 0.25, 0]} receiveShadow>
              <boxGeometry args={[CREST_DOWN_X - CREST_UP_X + 1.2, 0.5, DAM_HALF_WIDTH * 2 + 0.4]} />
              <meshStandardMaterial
                color="#4A535C"
                roughness={0.8}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {[CREST_UP_X - 0.3, CREST_DOWN_X + 0.3].map((x) => (
              <mesh key={x} position={[x, CREST_Y + 1.1, 0]} castShadow>
                <boxGeometry args={[0.5, 1.2, DAM_HALF_WIDTH * 2 + 0.4]} />
                <meshStandardMaterial
                  color="#A3ACB4"
                  roughness={0.85}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {/* Crest lamp posts */}
            {[-60, -40, -20, 0, 36, 56].map((z) =>
              z > SPILLWAY_Z0 - 1 && z < SPILLWAY_Z1 + 1 ? null : (
                <group key={z} position={[CREST_DOWN_X + 0.3, CREST_Y + 1.7, z]}>
                  <mesh position={[0, 1.6, 0]}>
                    <cylinderGeometry args={[0.08, 0.1, 3.2, 8]} />
                    <meshStandardMaterial color="#6A747D" metalness={0.6} roughness={0.4} />
                  </mesh>
                  <mesh position={[0, 3.25, 0]}>
                    <sphereGeometry args={[0.22, 10, 10]} />
                    <meshStandardMaterial color="#FFE7B0" emissive="#F5B942" emissiveIntensity={0.9} />
                  </mesh>
                </group>
              )
            )}
            {/* Toe plinth / foundation gallery outline */}
            <mesh position={[(UP_HEEL[0] + TOE[0]) / 2, -6.6, 0]} receiveShadow>
              <boxGeometry args={[TOE[0] - UP_HEEL[0] + 4, 1.2, DAM_HALF_WIDTH * 2 + 4]} />
              <meshStandardMaterial
                color="#3A434C"
                roughness={0.95}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Submerged Water Intake Bellmouth */}
      <ComponentGroup {...shared('comp-water-intake')} basePosition={[-32.5, 62, -6]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[3.2, 4.4, 5.5, 20]} />
              <meshStandardMaterial
                color="#5B6773"
                roughness={0.78}
                metalness={0.12}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Trash Rack Bar Screen (InstancedMesh) */}
      <ComponentGroup {...shared('comp-trash-rack')} basePosition={[-35.6, 62, -6]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh>
              <boxGeometry args={[0.45, 7.6, 5.4]} />
              <meshStandardMaterial
                color="#4E5E6E"
                roughness={0.45}
                metalness={0.78}
                wireframe
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <instancedMesh ref={trashBarsRef} args={[undefined, undefined, 12]}>
              <boxGeometry args={[0.28, 7.2, 0.14]} />
              <meshStandardMaterial
                color="#7E8F9F"
                roughness={0.35}
                metalness={0.85}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
          </group>
        )}
      </ComponentGroup>

      {/* Emergency Intake Gate & Hoist Tower */}
      <ComponentGroup {...shared('comp-intake-gate')} basePosition={[-28.5, 65, -6]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh position={[0, -2, 0]} castShadow>
              <boxGeometry args={[0.9, 6.2, 4.8]} />
              <meshStandardMaterial
                color="#3D4E5E"
                roughness={0.4}
                metalness={0.82}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[0, 14, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 28, 12]} />
              <meshStandardMaterial
                color="#9AA8B5"
                roughness={0.3}
                metalness={0.88}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Hoist house on the crest */}
            <mesh position={[0, 30.5, 0]} castShadow>
              <boxGeometry args={[4.2, 3.6, 6]} />
              <meshStandardMaterial
                color="#2B3540"
                roughness={0.5}
                metalness={0.4}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[0, 32.6, 0]}>
              <boxGeometry args={[4.6, 0.4, 6.4]} />
              <meshStandardMaterial
                color="#36C5D9"
                roughness={0.4}
                metalness={0.5}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Gated ogee spillway bay: crest gates, chute on the downstream face, flip bucket & stilling basin */}
      <ComponentGroup {...shared('comp-spillway')} basePosition={[-16, 40, 16]}>
        {(st: ComponentGroupRenderState) => (
          <group position={[16, -40, -16]}>
            <mesh geometry={chuteGeo} castShadow receiveShadow>
              <meshStandardMaterial
                color="#B3BBC2"
                roughness={0.7}
                metalness={0.04}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Training walls */}
            {[SPILLWAY_Z0 - 0.9, SPILLWAY_Z1].map((z) => (
              <mesh key={z} geometry={spillWallGeo} position={[0, 0, z]} castShadow>
                <meshStandardMaterial
                  color="#9AA3AB"
                  roughness={0.85}
                  side={THREE.DoubleSide}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {/* Crest piers + radial (Tainter) gates */}
            {[SPILLWAY_Z0 + 4, SPILLWAY_Z0 + 8].map((z) => (
              <mesh key={z} position={[(CREST_UP_X + CREST_DOWN_X) / 2, CREST_Y - 1.5, z]} castShadow>
                <boxGeometry args={[CREST_DOWN_X - CREST_UP_X + 1, 7, 0.9]} />
                <meshStandardMaterial
                  color="#9AA3AB"
                  roughness={0.85}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {[0, 1, 2].map((bay) => (
              <mesh
                key={bay}
                position={[CREST_UP_X + 2.2, SPILLWAY_CREST_Y + 2.2, SPILLWAY_Z0 + 2 + bay * 4]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <cylinderGeometry args={[3, 3, 3.2, 16, 1, true, Math.PI * 0.9, Math.PI * 0.45]} />
                <meshStandardMaterial
                  color="#3D4E5E"
                  roughness={0.42}
                  metalness={0.8}
                  side={THREE.DoubleSide}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {/* Gate hoist bridge */}
            <mesh position={[(CREST_UP_X + CREST_DOWN_X) / 2, CREST_Y + 2.6, (SPILLWAY_Z0 + SPILLWAY_Z1) / 2]}>
              <boxGeometry args={[3, 1.2, SPILLWAY_Z1 - SPILLWAY_Z0 + 2]} />
              <meshStandardMaterial
                color="#2B3540"
                roughness={0.5}
                metalness={0.5}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Stilling basin with baffle blocks */}
            <mesh position={[TOE[0] + 14, -6.4, (SPILLWAY_Z0 + SPILLWAY_Z1) / 2]} receiveShadow>
              <boxGeometry args={[16, 1.2, SPILLWAY_Z1 - SPILLWAY_Z0 + 2]} />
              <meshStandardMaterial
                color="#5B6773"
                roughness={0.9}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {[0, 1, 2, 3].map((k) => (
              <mesh key={k} position={[TOE[0] + 13, -5.3, SPILLWAY_Z0 + 1.5 + k * 3]}>
                <boxGeometry args={[1, 1, 1.2]} />
                <meshStandardMaterial
                  color="#6D7680"
                  roughness={0.9}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>
    </group>
  );
}
