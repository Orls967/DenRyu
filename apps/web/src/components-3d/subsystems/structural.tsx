import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';

export type Segment = [THREE.Vector3, THREE.Vector3];

const UP = new THREE.Vector3(0, 1, 0);

/** Renders many straight members (lattice steel, rails, braces) as one instanced mesh. */
export function SegmentLattice({
  segments,
  thickness = 0.12,
  color = '#7D8A97',
  clippingPlanes,
  st,
}: {
  segments: Segment[];
  thickness?: number;
  color?: string;
  clippingPlanes: THREE.Plane[];
  st: ComponentGroupRenderState;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = new THREE.Object3D();
    const dir = new THREE.Vector3();
    segments.forEach(([a, b], i) => {
      dir.subVectors(b, a);
      const len = dir.length();
      d.position.copy(a).addScaledVector(dir, 0.5);
      d.quaternion.setFromUnitVectors(UP, dir.normalize());
      d.scale.set(1, len, 1);
      d.updateMatrix();
      mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [segments]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, segments.length]} castShadow>
      <boxGeometry args={[thickness, 1, thickness]} />
      <meshStandardMaterial
        color={color}
        roughness={0.5}
        metalness={0.7}
        clippingPlanes={clippingPlanes}
        {...matOpacityProps(st, 1)}
      />
    </instancedMesh>
  );
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/**
 * Square lattice tower: four tapered legs, horizontal rings and X-bracing on every
 * face, plus optional horizontal cross-arm trusses (along Z) at given heights.
 */
export function latticeTowerSegments({
  base,
  top,
  height,
  levels,
  arms = [],
  origin = v(0, 0, 0),
}: {
  base: number;
  top: number;
  height: number;
  levels: number;
  arms?: { y: number; halfLength: number }[];
  origin?: THREE.Vector3;
}): Segment[] {
  const segs: Segment[] = [];
  const corner = (k: number, i: number) => {
    const t = k / levels;
    const h = THREE.MathUtils.lerp(base, top, t);
    const sx = i === 0 || i === 3 ? -1 : 1;
    const sz = i < 2 ? -1 : 1;
    return v(origin.x + sx * h, origin.y + t * height, origin.z + sz * h);
  };
  for (let k = 0; k < levels; k++) {
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      segs.push([corner(k, i), corner(k + 1, i)]); // leg
      segs.push([corner(k, i), corner(k + 1, j)]); // brace
      segs.push([corner(k, j), corner(k + 1, i)]); // counter-brace
      segs.push([corner(k + 1, i), corner(k + 1, j)]); // ring
    }
  }
  // Peak (earth-wire point)
  const apex = v(origin.x, origin.y + height + 1.4, origin.z);
  for (let i = 0; i < 4; i++) segs.push([corner(levels, i), apex]);

  for (const arm of arms) {
    const t = THREE.MathUtils.clamp(arm.y / height, 0, 1);
    const w = THREE.MathUtils.lerp(base, top, t);
    const y = origin.y + arm.y;
    const yTop = y + 0.6;
    for (const side of [-1, 1]) {
      const tipLow = v(origin.x, y, origin.z + side * arm.halfLength);
      const tipHigh = v(origin.x, yTop, origin.z + side * arm.halfLength);
      for (const sx of [-1, 1]) {
        const root = v(origin.x + sx * w * 0.8, y, origin.z + side * w);
        const rootHigh = v(origin.x + sx * w * 0.8, yTop, origin.z + side * w);
        segs.push([root, tipLow]);
        segs.push([rootHigh, tipHigh]);
        segs.push([root, tipHigh]);
      }
      segs.push([tipLow, tipHigh]);
    }
  }
  return segs;
}

/** Porcelain / polymer post insulator: core rod with a stack of sheds. */
export function Insulator({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  height,
  radius = 0.12,
  sheds = 8,
  color = '#C9D3DC',
  clippingPlanes,
  st,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  height: number;
  radius?: number;
  sheds?: number;
  color?: string;
  clippingPlanes: THREE.Plane[];
  st: ComponentGroupRenderState;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius * 0.7, radius * 0.8, height, 10]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} clippingPlanes={clippingPlanes} {...matOpacityProps(st, 1)} />
      </mesh>
      {Array.from({ length: sheds }).map((_, k) => (
        <mesh key={k} position={[0, ((k + 0.5) / sheds) * height, 0]}>
          <cylinderGeometry args={[radius * 1.9, radius * 1.9, height / sheds / 4, 14]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.05} clippingPlanes={clippingPlanes} {...matOpacityProps(st, 1)} />
        </mesh>
      ))}
      {/* Metal end fittings */}
      {[0, height].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[radius * 1.05, radius * 1.05, 0.12, 10]} />
          <meshStandardMaterial color="#7E8F9F" metalness={0.8} roughness={0.35} clippingPlanes={clippingPlanes} {...matOpacityProps(st, 1)} />
        </mesh>
      ))}
    </group>
  );
}

export { v as vec3 };
