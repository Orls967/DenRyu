import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId } from '@/types/domain';

export function SubFDischarge(props: Subsystem3DProps) {
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
    <group name="Subsystem_Discharge">
      {/* Draft Tube Outlet Bays & Splitter Pier */}
      <ComponentGroup {...shared('comp-draft-tube-outlet')} basePosition={[12.5, -5.2, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Outlet concrete portal */}
            <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
              <boxGeometry args={[3.2, 4.8, 7.6]} />
              <meshStandardMaterial
                color="#6D7680"
                roughness={0.88}
                metalness={0.05}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Central splitter pier */}
            <mesh position={[1.4, -0.2, 0]}>
              <boxGeometry args={[2.2, 3.2, 0.9]} />
              <meshStandardMaterial
                color="#5B6773"
                roughness={0.85}
                metalness={0.06}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Tailrace Channel Pool */}
      <ComponentGroup {...shared('comp-tailrace')} basePosition={[26, -5.6, 2]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Channel floor & side training walls */}
            <mesh position={[0, -1.8, 0]} receiveShadow>
              <boxGeometry args={[25, 0.8, 18]} />
              <meshStandardMaterial
                color="#333E4A"
                roughness={0.92}
                metalness={0.03}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Tailrace water surface */}
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[25, 3.2, 16.4]} />
              <meshStandardMaterial
                color="#2589D8"
                roughness={0.18}
                metalness={0.06}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.56)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* Downstream Natural River Channel */}
      <ComponentGroup {...shared('comp-downstream-channel')} basePosition={[52, -6.1, 2]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh position={[0, -1.7, 0]} receiveShadow>
              <boxGeometry args={[28, 0.8, 22]} />
              <meshStandardMaterial
                color="#1F2A35"
                roughness={0.95}
                metalness={0.0}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <boxGeometry args={[28, 2.8, 17.5]} />
              <meshStandardMaterial
                color="#1F75BC"
                roughness={0.2}
                metalness={0.05}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.56)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>
    </group>
  );
}
