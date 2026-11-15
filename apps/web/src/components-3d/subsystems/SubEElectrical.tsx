import { useMemo } from 'react';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId } from '@/types/domain';

export function SubEElectrical(props: Subsystem3DProps) {
  const catenaryCurves = useMemo(() => {
    return [-1.6, 0, 1.6].map((zOff) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(28, 13.5, -12 + zOff),
        new THREE.Vector3(34.5, 17.5, -12 + zOff),
        new THREE.Vector3(46, 15.2, -12 + zOff),
        new THREE.Vector3(58, 17.2, -12 + zOff),
      ]);
      return new THREE.TubeGeometry(curve, 24, 0.08, 8, false);
    });
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
    <group name="Subsystem_Electrical_Transmission">
      {/* Generator Terminal Chamber & 3 Bushings */}
      <ComponentGroup {...shared('comp-generator-terminal')} basePosition={[3.9, 9.6, -2.2]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh castShadow>
              <boxGeometry args={[1.4, 1.6, 2.4]} />
              <meshStandardMaterial
                color="#364454"
                roughness={0.45}
                metalness={0.75}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {[-0.7, 0, 0.7].map((zOff) => (
              <mesh key={zOff} position={[0.85, 0.2, zOff]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.16, 0.16, 0.9, 12]} />
                <meshStandardMaterial
                  color="#9EB2C2"
                  roughness={0.28}
                  metalness={0.2}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Isolated Phase Busbars (3 parallel ducts) */}
      <ComponentGroup {...shared('comp-busbar')} basePosition={[8.6, 9.8, -6.4]}>
        {(st: ComponentGroupRenderState) => (
          <group rotation={[0, 0.68, 0]}>
            {[-0.85, 0, 0.85].map((zOff) => (
              <mesh key={zOff} position={[0, 0, zOff]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.24, 0.24, 10.5, 14]} />
                <meshStandardMaterial
                  color="#8B98A5"
                  roughness={0.32}
                  metalness={0.85}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Generator Circuit Breaker (3-pole GCB) */}
      <ComponentGroup {...shared('comp-circuit-breaker')} basePosition={[8.6, 9.5, -6.4]}>
        {(st: ComponentGroupRenderState) => (
          <group rotation={[0, 0.68, 0]}>
            <mesh position={[0, -0.7, 0]} castShadow>
              <boxGeometry args={[2.0, 1.4, 2.8]} />
              <meshStandardMaterial
                color="#384858"
                roughness={0.45}
                metalness={0.7}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {[-0.85, 0, 0.85].map((zOff) => (
              <mesh key={zOff} position={[0, 0.45, zOff]}>
                <cylinderGeometry args={[0.28, 0.28, 1.3, 14]} />
                <meshStandardMaterial
                  color="#F5B942"
                  roughness={0.35}
                  metalness={0.4}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Generator Step-Up Transformer (GSU) */}
      <ComponentGroup {...shared('comp-step-up-transformer')} basePosition={[14.5, 8.2, -11.5]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Concrete oil containment pad */}
            <mesh position={[0, -2.0, 0]} receiveShadow>
              <boxGeometry args={[6.8, 0.6, 6.2]} />
              <meshStandardMaterial
                color="#5B6773"
                roughness={0.88}
                metalness={0.05}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Main Steel Tank (Cutaway capable) */}
            <mesh castShadow>
              <boxGeometry args={[4.4, 3.6, 3.2]} />
              <meshStandardMaterial
                color="#3A4654"
                roughness={0.45}
                metalness={0.75}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, st.opacityOverride ?? 1)}
              />
            </mesh>
            {/* Internal 3-limb core & copper windings visible in cutaway */}
            {[-1.1, 0, 1.1].map((xOff) => (
              <mesh key={xOff} position={[xOff, 0, 0]}>
                <cylinderGeometry args={[0.42, 0.42, 2.4, 14]} />
                <meshStandardMaterial
                  color="#B86B35"
                  roughness={0.32}
                  metalness={0.85}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {/* Cooling radiator banks */}
            {[-1.8, 1.8].map((xOff) => (
              <mesh key={xOff} position={[xOff, -0.1, 2.0]} castShadow>
                <boxGeometry args={[1.4, 2.8, 0.85]} />
                <meshStandardMaterial
                  color="#4E5E6E"
                  roughness={0.42}
                  metalness={0.78}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {/* Oil Conservator Drum */}
            <mesh position={[0, 2.6, -0.9]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.52, 0.52, 3.2, 16]} />
              <meshStandardMaterial
                color="#586878"
                roughness={0.45}
                metalness={0.7}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* 3 Tall HV Porcelain Bushings */}
            {[-1.2, 0, 1.2].map((xOff) => (
              <mesh key={xOff} position={[xOff, 2.9, 0.6]} rotation={[0.18, 0, 0]}>
                <cylinderGeometry args={[0.14, 0.22, 2.4, 12]} />
                <meshStandardMaterial
                  color="#9EB2C2"
                  roughness={0.25}
                  metalness={0.15}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Outdoor High-Voltage Switchyard */}
      <ComponentGroup {...shared('comp-switchyard')} basePosition={[25.5, 6.4, -12]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Gravel Yard Pad */}
            <mesh position={[0, -0.2, 0]} receiveShadow>
              <boxGeometry args={[13, 0.5, 10]} />
              <meshStandardMaterial
                color="#26313D"
                roughness={0.95}
                metalness={0.02}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Lattice Portal Gantry Columns */}
            {[-4.2, 4.2].map((zOff) => (
              <mesh key={zOff} position={[2.5, 4.0, zOff]} castShadow>
                <boxGeometry args={[0.55, 8.0, 0.55]} />
                <meshStandardMaterial
                  color="#7D8A97"
                  roughness={0.42}
                  metalness={0.8}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
            {/* Crossbeam */}
            <mesh position={[2.5, 7.2, 0]}>
              <boxGeometry args={[0.6, 0.6, 9.6]} />
              <meshStandardMaterial
                color="#7D8A97"
                roughness={0.42}
                metalness={0.8}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* HV Breaker & Insulator Stacks */}
            {[-2.2, 0, 2.2].map((zOff) => (
              <mesh key={zOff} position={[-2.2, 1.8, zOff]}>
                <cylinderGeometry args={[0.24, 0.28, 3.2, 12]} />
                <meshStandardMaterial
                  color="#9EB2C2"
                  roughness={0.3}
                  metalness={0.25}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Overhead ACSR Transmission Line & Lattice Pylon */}
      <ComponentGroup {...shared('comp-transmission-line')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Lattice Pylon */}
            <mesh position={[34.5, 12.2, -12]} castShadow>
              <cylinderGeometry args={[0.45, 1.65, 13.5, 4]} />
              <meshStandardMaterial
                color="#7D8A97"
                roughness={0.45}
                metalness={0.82}
                wireframe
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[34.5, 17.5, -12]}>
              <boxGeometry args={[0.5, 0.45, 5.4]} />
              <meshStandardMaterial
                color="#7D8A97"
                roughness={0.45}
                metalness={0.82}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {catenaryCurves.map((geo, idx) => (
              <mesh key={idx} geometry={geo}>
                <meshStandardMaterial
                  color="#9AA6B2"
                  roughness={0.3}
                  metalness={0.85}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Electrical Grid Horizon Terminal Node */}
      <ComponentGroup {...shared('comp-electrical-grid')} basePosition={[58.5, 11.5, -12]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh position={[0, -5.2, 0]} receiveShadow>
              <boxGeometry args={[6.5, 0.8, 7.5]} />
              <meshStandardMaterial
                color="#202C37"
                roughness={0.8}
                metalness={0.2}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.5, 1.4, 11.5, 4]} />
              <meshStandardMaterial
                color="#697D91"
                roughness={0.45}
                metalness={0.78}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[0, 5.7, 0]}>
              <boxGeometry args={[0.5, 0.5, 5.0]} />
              <meshStandardMaterial
                color="#F5B942"
                roughness={0.3}
                metalness={0.5}
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
