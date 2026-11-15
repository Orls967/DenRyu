import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  ComponentGroup,
  matOpacityProps,
  type ComponentGroupRenderState,
} from '@/components-3d/subsystems/ComponentGroup';
import type { Subsystem3DProps } from '@/components-3d/subsystems/SubAReservoirDam';
import type { ComponentId } from '@/types/domain';

export function SubBConveyance(props: Subsystem3DProps) {
  const flangesRef = useRef<THREE.InstancedMesh>(null);

  const penstockCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, 62, 0),
      new THREE.Vector3(-13.5, 58, 0),
      new THREE.Vector3(-9.5, 28, 0),
      new THREE.Vector3(-7.0, 2.5, 0),
      new THREE.Vector3(-5.5, 0, 0),
    ]);
  }, []);

  const penstockGeo = useMemo(() => {
    return new THREE.TubeGeometry(penstockCurve, 36, 1.85, 20, false);
  }, [penstockCurve]);

  useLayoutEffect(() => {
    const mesh = flangesRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < 8; i++) {
      const t = 0.08 + i * 0.12;
      const pt = penstockCurve.getPointAt(t);
      const tangent = penstockCurve.getTangentAt(t).normalize();
      dummy.position.copy(pt);
      dummy.quaternion.setFromUnitVectors(up, tangent);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [penstockCurve]);

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
    <group name="Subsystem_Water_Conveyance">
      {/* Headrace Conduit */}
      <ComponentGroup {...shared('comp-headrace')} basePosition={[-23.5, 62, -4]}>
        {(st: ComponentGroupRenderState) => (
          <mesh rotation={[0, -0.35, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[2.35, 2.35, 9.5, 20]} />
            <meshStandardMaterial
              color="#5A6570"
              roughness={0.82}
              metalness={0.1}
              side={THREE.DoubleSide}
              clippingPlanes={props.clippingPlanes}
              {...matOpacityProps(st, 1)}
            />
          </mesh>
        )}
      </ComponentGroup>

      {/* Underground Pressure Tunnel */}
      <ComponentGroup {...shared('comp-pressure-tunnel')} basePosition={[-17.2, 62, -1]}>
        {(st: ComponentGroupRenderState) => (
          <mesh rotation={[0, -0.35, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[2.2, 2.2, 6.8, 20]} />
            <meshStandardMaterial
              color="#43505C"
              roughness={0.75}
              metalness={0.2}
              side={THREE.DoubleSide}
              clippingPlanes={props.clippingPlanes}
              {...matOpacityProps(st, 1)}
            />
          </mesh>
        )}
      </ComponentGroup>

      {/* Surge Tank Standpipe + Cutaway Water Column */}
      <ComponentGroup {...shared('comp-surge-tank')} basePosition={[-15, 78, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            {/* Outer concrete/steel shaft */}
            <mesh castShadow>
              <cylinderGeometry args={[3.4, 3.4, 32, 24, 1, true]} />
              <meshStandardMaterial
                color="#5B6773"
                roughness={0.72}
                metalness={0.25}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, st.opacityOverride ?? 0.52)}
              />
            </mesh>
            {/* Internal water column at reservoir level */}
            <mesh position={[0, -3.5, 0]}>
              <cylinderGeometry args={[3.0, 3.0, 23, 20]} />
              <meshStandardMaterial
                color="#2589D8"
                roughness={0.18}
                metalness={0.05}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 0.72)}
              />
            </mesh>
            {/* Top vent rim */}
            <mesh position={[0, 16, 0]}>
              <torusGeometry args={[3.4, 0.35, 10, 24]} />
              <meshStandardMaterial
                color="#7E8F9F"
                roughness={0.4}
                metalness={0.75}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
          </group>
        )}
      </ComponentGroup>

      {/* High-Pressure Inclined Steel Penstock + Stiffener Flanges */}
      <ComponentGroup {...shared('comp-penstock')} basePosition={[0, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh geometry={penstockGeo} castShadow receiveShadow>
              <meshStandardMaterial
                color="#3D4E5E"
                roughness={0.45}
                metalness={0.78}
                side={THREE.DoubleSide}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            <instancedMesh ref={flangesRef} args={[undefined, undefined, 8]}>
              <cylinderGeometry args={[2.15, 2.15, 0.42, 20]} />
              <meshStandardMaterial
                color="#7E8F9F"
                roughness={0.35}
                metalness={0.85}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </instancedMesh>
            {/* Concrete anchor saddles */}
            {[-11, -8.5].map((xPos, idx) => (
              <mesh key={xPos} position={[xPos, idx === 0 ? 35 : 14, 0]} receiveShadow>
                <boxGeometry args={[3.5, 6.5, 5.2]} />
                <meshStandardMaterial
                  color="#6D7680"
                  roughness={0.9}
                  metalness={0.05}
                  clippingPlanes={props.clippingPlanes}
                  {...matOpacityProps(st, 1)}
                />
              </mesh>
            ))}
          </group>
        )}
      </ComponentGroup>

      {/* Main Inlet Valve (Butterfly Guard Valve) */}
      <ComponentGroup {...shared('comp-main-inlet-valve')} basePosition={[-4.8, 0, 0]}>
        {(st: ComponentGroupRenderState) => (
          <group>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[2.1, 2.1, 1.8, 24]} />
              <meshStandardMaterial
                color="#4E5E6E"
                roughness={0.38}
                metalness={0.82}
                clippingPlanes={props.clippingPlanes}
                {...matOpacityProps(st, 1)}
              />
            </mesh>
            {/* Servomotor actuator housing */}
            <mesh position={[0, 1.8, 2.2]}>
              <boxGeometry args={[1.4, 2.4, 1.2]} />
              <meshStandardMaterial
                color="#36C5D9"
                roughness={0.35}
                metalness={0.6}
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
