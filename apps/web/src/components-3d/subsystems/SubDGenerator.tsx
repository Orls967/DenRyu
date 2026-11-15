import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId } from '@/types/domain';

export function SubDGenerator(
  props: Subsystem3DProps & {
    angularSpeedRadS: number;
    reducedMotion: boolean;
  }
) {
  const polesRef = useRef<THREE.InstancedMesh>(null);
  const fieldCoilsRef = useRef<THREE.InstancedMesh>(null);
  const statorBarsRef = useRef<THREE.InstancedMesh>(null);
  const rotorSpinRef = useRef<THREE.Group>(null);
  const fieldSpinRef = useRef<THREE.Group>(null);

  // 24 Salient Rotor Poles + 24 Copper Field Winding Coils
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    if (polesRef.current) {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 2.28, 0, Math.sin(a) * 2.28);
        dummy.rotation.set(0, -a, 0);
        dummy.updateMatrix();
        polesRef.current.setMatrixAt(i, dummy.matrix);
      }
      polesRef.current.instanceMatrix.needsUpdate = true;
    }
    if (fieldCoilsRef.current) {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 2.18, 0, Math.sin(a) * 2.18);
        dummy.rotation.set(0, -a, 0);
        dummy.updateMatrix();
        fieldCoilsRef.current.setMatrixAt(i, dummy.matrix);
      }
      fieldCoilsRef.current.instanceMatrix.needsUpdate = true;
    }
    if (statorBarsRef.current) {
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        dummy.position.set(Math.cos(a) * 2.66, 0, Math.sin(a) * 2.66);
        dummy.rotation.set(0, -a, 0);
        dummy.updateMatrix();
        statorBarsRef.current.setMatrixAt(i, dummy.matrix);
      }
      statorBarsRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

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

  return (
    <group name="Subsystem_Generator">
      {/* Thrust & Guide Bearings + Spider Bracket */}
      <ComponentGroup {...shared('comp-bearings')} basePosition={[0, 6.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Oil-bath thrust pot */}
            <mesh castShadow>
              <cylinderGeometry args={[1.15, 1.25, 0.85, 24]} />
              <meshStandardMaterial
                color="#586776"
                roughness={0.38}
                metalness={0.82}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* 6-arm bearing support spider */}
            {[0, 1, 2].map((arm) => (
              <mesh key={arm} rotation={[0, (arm * Math.PI) / 3, 0]}>
                <boxGeometry args={[6.6, 0.45, 0.42]} />
                <meshStandardMaterial
                  color="#4E5E6E"
                  roughness={0.45}
                  metalness={0.78}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* 24-Pole Salient-Pole Rotor */}
      <ComponentGroup {...shared('comp-rotor')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={rotorSpinRef}>
            {/* Hub & Rim */}
            <mesh castShadow>
              <cylinderGeometry args={[2.12, 2.12, 1.85, 32]} />
              <meshStandardMaterial
                color="#8C9BA8"
                roughness={0.3}
                metalness={0.9}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* 24 Salient Poles */}
            <instancedMesh ref={polesRef} args={[undefined, undefined, 24]}>
              <boxGeometry args={[0.38, 1.72, 0.34]} />
              <meshStandardMaterial
                color="#7B8C9C"
                roughness={0.28}
                metalness={0.88}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
          </group>
        )}
      </ComponentGroup>

      {/* Rotor DC Field Winding Coils (24 coils) */}
      <ComponentGroup {...shared('comp-field-winding')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group ref={fieldSpinRef}>
            <instancedMesh ref={fieldCoilsRef} args={[undefined, undefined, 24]}>
              <boxGeometry args={[0.26, 1.56, 0.44]} />
              <meshStandardMaterial
                color="#C4773B"
                roughness={0.3}
                metalness={0.88}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
          </group>
        )}
      </ComponentGroup>

      {/* Laminated Stator Core & Frame */}
      <ComponentGroup {...shared('comp-stator')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[3.25, 3.25, 2.25, 36, 1, true]} />
              <meshStandardMaterial
                color="#2B3540"
                roughness={0.55}
                metalness={0.65}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.95, 0.28, 10, 36]} />
              <meshStandardMaterial
                color="#3A4754"
                roughness={0.5}
                metalness={0.7}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Copper Stator Armature Winding & End-Turns */}
      <ComponentGroup {...shared('comp-stator-winding')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <instancedMesh ref={statorBarsRef} args={[undefined, undefined, 36]}>
              <boxGeometry args={[0.14, 2.55, 0.14]} />
              <meshStandardMaterial
                color="#B86B35"
                roughness={0.28}
                metalness={0.88}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
            {/* Top & Bottom Basket End-Turn Rings */}
            {[1.28, -1.28].map((yPos) => (
              <mesh key={yPos} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2.68, 0.18, 10, 36]} />
                <meshStandardMaterial
                  color="#B86B35"
                  roughness={0.28}
                  metalness={0.88}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Closed-Loop Air-to-Water Cooling System */}
      <ComponentGroup {...shared('comp-cooling-system')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2 + 0.3;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 3.55, 0, Math.sin(a) * 3.55]}
                  rotation={[0, -a, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.55, 1.9, 1.1]} />
                  <meshStandardMaterial
                    color="#4A6278"
                    roughness={0.4}
                    metalness={0.75}
                    clippingPlanes={props.clippingPlanes}
                    {...matOpacityProps(st, 1)}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </ComponentGroup>

      {/* Static Thyristor Excitation System & Slip-Ring Housing */}
      <ComponentGroup {...shared('comp-excitation-system')} basePosition={[0, 12.1, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Top shaft slip-ring collector housing */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.72, 0.72, 1.1, 18]} />
              <meshStandardMaterial
                color="#36C5D9"
                roughness={0.35}
                metalness={0.65}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* AVR & Thyristor Rectifier Cabinet */}
            <mesh position={[0, -1.3, -4.6]} castShadow>
              <boxGeometry args={[1.6, 2.2, 1.2]} />
              <meshStandardMaterial
                color="#2A3644"
                roughness={0.48}
                metalness={0.6}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Generator Outer Barrel Housing */}
      <ComponentGroup {...shared('comp-generator-housing')} basePosition={[0, 9.8, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh castShadow>
              <cylinderGeometry args={[4.15, 4.15, 3.6, 36, 1, true]} />
              <meshStandardMaterial
                color="#2B3540"
                roughness={0.55}
                metalness={0.6}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.78)}
              />
            </mesh>
            {/* Upper removable deck hatch rim */}
            <mesh position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.1, 4.15, 36]} />
              <meshStandardMaterial
                color="#374554"
                roughness={0.5}
                metalness={0.65}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.85)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>
    </group>
  );
}
