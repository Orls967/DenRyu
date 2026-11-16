import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Decorative cut-away powerhouse around the generating unit: upstream and back
 * walls, a generator-floor grating with the stator pit opening, steel roof
 * trusses and the overhead bridge crane. The +X and +Z sides stay open so the
 * machinery remains visible. Not selectable; ghosts while a component is isolated.
 */
const X0 = -8.6;
const X1 = 12.5;
const Z0 = -9.6;
const Z1 = 9.6;
const FLOOR_Y = 7.7;
const ROOF_Y = 19;

const noRaycast = () => null;

export function Powerhouse({
  clippingPlanes,
  ghosted,
}: {
  clippingPlanes: THREE.Plane[];
  ghosted: boolean;
}) {
  const floorGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(X0, Z0);
    shape.lineTo(X1, Z0);
    shape.lineTo(X1, Z1);
    shape.lineTo(X0, Z1);
    shape.lineTo(X0, Z0);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 4.6, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.35, bevelEnabled: false });
    geo.rotateX(Math.PI / 2);
    geo.translate(0, FLOOR_Y + 0.35, 0);
    return geo;
  }, []);

  const op = (base: number) => {
    const opacity = ghosted ? Math.min(base, 0.06) : base;
    return { transparent: opacity < 0.99, opacity, depthWrite: opacity >= 0.99 };
  };

  const trussXs = useMemo(() => {
    const xs: number[] = [];
    for (let x = X0 + 1; x <= X1; x += 3.5) xs.push(x);
    return xs;
  }, []);

  return (
    <group name="Powerhouse_Cutaway" userData={{ isDecorative: true }}>
      {/* Back wall */}
      <mesh position={[(X0 + X1) / 2, (ROOF_Y - 7) / 2, Z0 - 0.3]} raycast={noRaycast} receiveShadow>
        <boxGeometry args={[X1 - X0, ROOF_Y + 7, 0.6]} />
        <meshStandardMaterial color="#3A4652" roughness={0.9} clippingPlanes={clippingPlanes} {...op(1)} />
      </mesh>
      {/* Upstream wall (penstock enters through it) */}
      <mesh position={[X0 - 0.3, (ROOF_Y - 7) / 2, 0]} raycast={noRaycast} receiveShadow>
        <boxGeometry args={[0.6, ROOF_Y + 7, Z1 - Z0 + 0.6]} />
        <meshStandardMaterial color="#34404B" roughness={0.9} clippingPlanes={clippingPlanes} {...op(1)} />
      </mesh>
      {/* Generator floor grating with stator pit */}
      <mesh geometry={floorGeo} raycast={noRaycast} receiveShadow>
        <meshStandardMaterial
          color="#4B5866"
          roughness={0.7}
          metalness={0.3}
          side={THREE.DoubleSide}
          clippingPlanes={clippingPlanes}
          {...op(0.55)}
        />
      </mesh>
      {/* Floor edge handrail */}
      <mesh position={[X1, FLOOR_Y + 1, 0]} raycast={noRaycast}>
        <boxGeometry args={[0.08, 0.08, Z1 - Z0]} />
        <meshStandardMaterial color="#F5B942" clippingPlanes={clippingPlanes} {...op(1)} />
      </mesh>
      {/* Columns */}
      {[
        [X1, Z0],
        [X1, Z1],
        [X0, Z1],
      ].map(([x, z]) => (
        <mesh key={`${x}:${z}`} position={[x, (ROOF_Y - 7) / 2, z]} raycast={noRaycast} castShadow>
          <boxGeometry args={[0.6, ROOF_Y + 7, 0.6]} />
          <meshStandardMaterial color="#56636F" roughness={0.6} metalness={0.4} clippingPlanes={clippingPlanes} {...op(1)} />
        </mesh>
      ))}
      {/* Roof trusses */}
      {trussXs.map((x) => (
        <mesh key={x} position={[x, ROOF_Y, 0]} raycast={noRaycast}>
          <boxGeometry args={[0.3, 0.7, Z1 - Z0]} />
          <meshStandardMaterial color="#56636F" roughness={0.6} metalness={0.5} clippingPlanes={clippingPlanes} {...op(1)} />
        </mesh>
      ))}
      {/* Crane runway beams + bridge crane */}
      {[Z0 + 0.6, Z1 - 0.6].map((z) => (
        <mesh key={z} position={[(X0 + X1) / 2, ROOF_Y - 2.2, z]} raycast={noRaycast}>
          <boxGeometry args={[X1 - X0, 0.5, 0.4]} />
          <meshStandardMaterial color="#56636F" metalness={0.5} roughness={0.5} clippingPlanes={clippingPlanes} {...op(1)} />
        </mesh>
      ))}
      <group position={[3.5, ROOF_Y - 1.7, 0]}>
        <mesh raycast={noRaycast} castShadow>
          <boxGeometry args={[1.1, 0.8, Z1 - Z0 - 0.6]} />
          <meshStandardMaterial color="#F5B942" roughness={0.5} metalness={0.3} clippingPlanes={clippingPlanes} {...op(1)} />
        </mesh>
        <mesh position={[0, -0.7, 0]} raycast={noRaycast}>
          <boxGeometry args={[1.4, 0.7, 1.4]} />
          <meshStandardMaterial color="#2B3540" roughness={0.5} metalness={0.5} clippingPlanes={clippingPlanes} {...op(1)} />
        </mesh>
        <mesh position={[0, -3.2, 0]} raycast={noRaycast}>
          <cylinderGeometry args={[0.03, 0.03, 4.4, 6]} />
          <meshStandardMaterial color="#9AA8B5" clippingPlanes={clippingPlanes} {...op(1)} />
        </mesh>
      </group>
    </group>
  );
}
