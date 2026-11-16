import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { EnergyJourneyStage } from '@/types/domain';

export type FlowMode =
  | 'ambient'
  | 'none'
  | 'water_flow_runner'
  | EnergyJourneyStage['animationMode'];

export function FlowVisualizers({
  mode = 'ambient',
  flowRateM3s = 60,
  electricalPowerW = 44_551_816,
  reducedMotion = false,
}: {
  mode?: FlowMode;
  flowRateM3s?: number;
  electricalPowerW?: number;
  reducedMotion?: boolean;
}) {
  const waterParticlesRef = useRef<THREE.InstancedMesh>(null);
  const swirlParticlesRef = useRef<THREE.InstancedMesh>(null);
  const elecParticlesRef = useRef<THREE.InstancedMesh>(null);
  const torqueRingRef = useRef<THREE.Group>(null);
  const fluxGroupRef = useRef<THREE.Group>(null);

  const waterCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-42, 62, -6),
      new THREE.Vector3(-32, 62, -6),
      new THREE.Vector3(-23, 62, -4),
      new THREE.Vector3(-15, 62, 0),
      new THREE.Vector3(-9.5, 28, 0),
      new THREE.Vector3(-5.5, 0, 0),
      new THREE.Vector3(-3.2, 0, -1.2),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -3.5, 0),
      new THREE.Vector3(3.0, -5.3, 0),
      new THREE.Vector3(12.5, -5.3, 0),
      new THREE.Vector3(28, -5.3, 1.5),
      new THREE.Vector3(56, -5.3, 2),
    ]);
  }, []);

  const elecCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(3.9, 9.8, -2.2),
      new THREE.Vector3(8.6, 9.8, -6.4),
      new THREE.Vector3(14.5, 9.8, -11.5),
      new THREE.Vector3(25.5, 11.2, -12),
      new THREE.Vector3(34.5, 17.5, -12),
      new THREE.Vector3(46, 15.2, -12),
      new THREE.Vector3(58.5, 17.0, -12),
    ]);
  }, []);

  const waterCount = 42;
  const swirlCount = 24;
  const elecCount = 22;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tangentHelper = useMemo(() => new THREE.Vector3(), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  const flowSpeedScale = Math.max(0, Math.min(1.8, flowRateM3s / 60));
  const elecSpeedScale = Math.max(0, Math.min(1.6, electricalPowerW / 44_551_816));

  useFrame(({ clock }, delta) => {
    const tBase = reducedMotion ? 0 : clock.getElapsedTime();

    // Main hydraulic path particles
    if (waterParticlesRef.current) {
      for (let i = 0; i < waterCount; i++) {
        const u = ((i / waterCount) + tBase * 0.08 * flowSpeedScale) % 1;
        const pt = waterCurve.getPointAt(u);
        tangentHelper.copy(waterCurve.getTangentAt(u)).normalize();
        dummy.position.copy(pt);
        dummy.quaternion.setFromUnitVectors(upVec, tangentHelper);
        const s = flowRateM3s > 0.2 ? (mode === 'conveyance' || mode === 'intake' ? 1.25 : 0.95) : 0;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        waterParticlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      waterParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // Spiral casing -> Francis runner swirl particles
    if (swirlParticlesRef.current) {
      for (let i = 0; i < swirlCount; i++) {
        const phase = ((i / swirlCount) + tBase * 0.25 * flowSpeedScale) % 1;
        const theta = phase * Math.PI * 3.5;
        const radius = THREE.MathUtils.lerp(3.4, 0.75, phase);
        const y = THREE.MathUtils.lerp(0.15, -1.6, Math.pow(phase, 1.8));
        dummy.position.set(Math.cos(theta) * radius, y, Math.sin(theta) * radius);
        dummy.rotation.set(0, -theta, 0);
        const s =
          flowRateM3s > 0.2 && (mode === 'turbine' || mode === 'water_flow_runner' || mode === 'ambient')
            ? 1.0
            : 0;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        swirlParticlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      swirlParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    // Electrical transmission pulses
    if (elecParticlesRef.current) {
      for (let i = 0; i < elecCount; i++) {
        const u = ((i / elecCount) + tBase * 0.14 * Math.max(0.2, elecSpeedScale)) % 1;
        const pt = elecCurve.getPointAt(u);
        tangentHelper.copy(elecCurve.getTangentAt(u)).normalize();
        dummy.position.copy(pt);
        dummy.quaternion.setFromUnitVectors(upVec, tangentHelper);
        const s =
          electricalPowerW > 1000 &&
          (mode === 'generator' ||
            mode === 'transformer' ||
            mode === 'transmission' ||
            mode === 'ambient')
            ? 1.0
            : 0;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        elecParticlesRef.current.setMatrixAt(i, dummy.matrix);
      }
      elecParticlesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (torqueRingRef.current && !reducedMotion && flowRateM3s > 0.2) {
      torqueRingRef.current.rotation.y -= delta * 1.6 * flowSpeedScale;
    }
    if (fluxGroupRef.current && !reducedMotion && electricalPowerW > 1000) {
      fluxGroupRef.current.rotation.y -= delta * 1.2;
    }
  });

  const showTorqueRing = mode === 'turbine' || mode === 'shaft' || mode === 'water_flow_runner';
  const showMagneticFlux = mode === 'generator';

  return (
    <group userData={{ isDecorative: true }}>
      {/* Water directional cones/chevrons */}
      <instancedMesh ref={waterParticlesRef} args={[undefined, undefined, waterCount]}>
        <coneGeometry args={[0.32, 0.95, 8]} />
        <meshStandardMaterial
          color="#36C5D9"
          emissive="#2589D8"
          emissiveIntensity={0.7}
          roughness={0.2}
        />
      </instancedMesh>

      {/* Spiral-to-runner swirl droplets */}
      <instancedMesh ref={swirlParticlesRef} args={[undefined, undefined, swirlCount]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial
          color="#60C8FF"
          emissive="#2589D8"
          emissiveIntensity={0.8}
        />
      </instancedMesh>

      {/* Electrical energy pulses */}
      <instancedMesh ref={elecParticlesRef} args={[undefined, undefined, elecCount]}>
        <sphereGeometry args={[0.24, 10, 10]} />
        <meshStandardMaterial
          color="#F5B942"
          emissive="#F5B942"
          emissiveIntensity={0.95}
        />
      </instancedMesh>

      {/* Shaft / Runner Torque Vector Ring */}
      {showTorqueRing ? (
        <group ref={torqueRingRef} position={[0, mode === 'shaft' ? 4.8 : 0.85, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.65, 0.06, 8, 36, Math.PI * 1.65]} />
            <meshStandardMaterial
              color="#F5B942"
              emissive="#F5B942"
              emissiveIntensity={0.85}
            />
          </mesh>
        </group>
      ) : null}

      {/* Generator Air-Gap Magnetic Flux Rings */}
      {showMagneticFlux ? (
        <group ref={fluxGroupRef} position={[0, 9.8, 0]}>
          {[0, 1, 2, 3].map((idx) => (
            <mesh
              key={idx}
              rotation={[Math.PI / 2, 0, (idx * Math.PI) / 2]}
            >
              <torusGeometry args={[2.52, 0.05, 8, 32, Math.PI * 0.4]} />
              <meshStandardMaterial
                color="#36C5D9"
                emissive="#36C5D9"
                emissiveIntensity={0.9}
              />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
}
