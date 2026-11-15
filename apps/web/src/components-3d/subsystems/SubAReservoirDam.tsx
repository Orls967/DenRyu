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

export function SubAReservoirDam(props: Subsystem3DProps) {
  const trashBarsRef = useRef<THREE.InstancedMesh>(null);

  const damGeo = useMemo(() => {
    const shape = new THREE.Shape();
    // Stepped gravity dam cross section in XY plane, extruded along Z
    shape.moveTo(-42, -6);
    shape.lineTo(-10, -6);
    shape.lineTo(-18, 92);
    shape.lineTo(-27, 92);
    shape.lineTo(-33, 60);
    shape.lineTo(-42, -6);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 56,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -28);
    return geo;
  }, []);

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
      {/* Reservoir Water Volume */}
      <ComponentGroup {...shared('comp-reservoir')} basePosition={[-58, 39, 0]}>
        {(st: ComponentGroupRenderState) => (
          <mesh receiveShadow>
            <boxGeometry args={[52, 86, 56]} />
            <meshStandardMaterial
              color="#2589D8"
              roughness={0.15}
              metalness={0.05}
              side={THREE.DoubleSide}
              clippingPlanes={props.clippingPlanes}
              {...matOpacityProps(st, 0.56)}
            />
          </mesh>
        )}
      </ComponentGroup>

      {/* Concrete Gravity Dam */}
      <ComponentGroup {...shared('comp-dam')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh geometry={damGeo} castShadow receiveShadow>
              <meshStandardMaterial
                color="#6D7680"
                roughness={0.88}
                metalness={0.05}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Crest parapet & inspection deck */}
            <mesh position={[-22.5, 93.2, 0]} castShadow>
              <boxGeometry args={[9.5, 2.2, 56.4]} />
              <meshStandardMaterial
                color="#7B8590"
                roughness={0.85}
                metalness={0.08}
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
            {/* Gate Leaf */}
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
            {/* Hoist Stem & Crest Pedestal */}
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
            <mesh position={[0, 29, 0]} castShadow>
              <boxGeometry args={[2.6, 3.2, 5.2]} />
              <meshStandardMaterial
                color="#2B3540"
                roughness={0.5}
                metalness={0.65}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Gated Ogee Spillway Chute & Stilling Apron */}
      <ComponentGroup {...shared('comp-spillway')} basePosition={[-16, 40, 16]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Chute ramp */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, -0.82]} castShadow receiveShadow>
              <boxGeometry args={[12, 108, 14]} />
              <meshStandardMaterial
                color="#7B848E"
                roughness={0.85}
                metalness={0.05}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Spillway Piers & Radial Tainter Gates */}
            {[-4.5, 0, 4.5].map((zOff) => (
              <mesh key={zOff} position={[-7, 50, zOff]} castShadow>
                <boxGeometry args={[7, 9, 1.1]} />
                <meshStandardMaterial
                  color="#6D7680"
                  roughness={0.85}
                  metalness={0.06}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            <mesh position={[-6, 49, 0]} rotation={[0, 0, 0.3]}>
              <boxGeometry args={[1.4, 5.5, 11.5]} />
              <meshStandardMaterial
                color="#3D4E5E"
                roughness={0.42}
                metalness={0.8}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Stilling Basin Apron */}
            <mesh position={[35, -45, 0]} receiveShadow>
              <boxGeometry args={[22, 3, 16]} />
              <meshStandardMaterial
                color="#5B6773"
                roughness={0.9}
                metalness={0.05}
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
