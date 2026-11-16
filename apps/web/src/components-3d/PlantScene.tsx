import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

import { StudioLighting } from '@/components-3d/StudioLighting';
import { CAMERA_PRESETS } from '@/components-3d/presets';
import { SubAReservoirDam } from '@/components-3d/subsystems/SubAReservoirDam';
import { SubBConveyance } from '@/components-3d/subsystems/SubBConveyance';
import { SubCTurbine } from '@/components-3d/subsystems/SubCTurbine';
import { SubDGenerator } from '@/components-3d/subsystems/SubDGenerator';
import { SubEElectrical } from '@/components-3d/subsystems/SubEElectrical';
import { SubFDischarge } from '@/components-3d/subsystems/SubFDischarge';
import { FlowVisualizers, type FlowMode } from '@/components-3d/effects/FlowVisualizers';
import type { SectionCutState } from '@/stores/anatomyStore';
import { useUiStore } from '@/stores/uiStore';
import type { ComponentId, RunnerInspectionMode } from '@/types/domain';

function CameraRig({
  presetKey,
  resetTick,
  autoOrbit = false,
  reducedMotion = false,
  onUserOrbitStart,
  onTransitionSettled,
}: {
  presetKey: string;
  resetTick: number;
  autoOrbit?: boolean;
  reducedMotion?: boolean;
  onUserOrbitStart?: () => void;
  onTransitionSettled?: () => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const animatingRef = useRef(false);
  const goalPosRef = useRef(new THREE.Vector3(48, 46, 78));
  const goalTargetRef = useRef(new THREE.Vector3(0, 14, 0));
  const userInteractedRef = useRef(false);

  useEffect(() => {
    const preset = CAMERA_PRESETS[presetKey] ?? CAMERA_PRESETS['cam-preset-full-plant'];
    goalPosRef.current.set(...preset.position);
    goalTargetRef.current.set(...preset.target);
    userInteractedRef.current = false;

    if (reducedMotion) {
      camera.position.copy(goalPosRef.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(goalTargetRef.current);
        controlsRef.current.update();
      }
      animatingRef.current = false;
      onTransitionSettled?.();
    } else {
      animatingRef.current = true;
    }
  }, [presetKey, resetTick, reducedMotion, camera, onTransitionSettled]);

  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    if (animatingRef.current) {
      const alpha = 1 - Math.exp(-5.5 * delta);
      camera.position.lerp(goalPosRef.current, alpha);
      ctrl.target.lerp(goalTargetRef.current, alpha);
      ctrl.update();

      if (
        camera.position.distanceTo(goalPosRef.current) < 0.12 &&
        ctrl.target.distanceTo(goalTargetRef.current) < 0.12
      ) {
        camera.position.copy(goalPosRef.current);
        ctrl.target.copy(goalTargetRef.current);
        ctrl.update();
        animatingRef.current = false;
        onTransitionSettled?.();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.07}
      minDistance={2.5}
      maxDistance={165}
      maxPolarAngle={Math.PI * 0.495}
      autoRotate={autoOrbit && !reducedMotion && !userInteractedRef.current}
      autoRotateSpeed={0.45}
      onStart={() => {
        animatingRef.current = false;
        userInteractedRef.current = true;
        onUserOrbitStart?.();
      }}
    />
  );
}

function CutawayPlinth() {
  return (
    <group userData={{ isDecorative: true }}>
      {/* Main architectural museum plinth slab */}
      <mesh position={[0, -9.2, 0]} receiveShadow>
        <boxGeometry args={[175, 2.5, 90]} />
        <meshStandardMaterial color="#1B242E" roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Powerhouse substructure concrete floor & outdoor yard terrace */}
      <mesh position={[20, 5.6, -12]} receiveShadow>
        <boxGeometry args={[36, 1.0, 16]} />
        <meshStandardMaterial color="#232E3A" roughness={0.9} metalness={0.05} />
      </mesh>
      {/* Subtle architectural reference grid */}
      <gridHelper args={[170, 34, '#2B3B4A', '#17202A']} position={[0, -7.92, 0]} />
    </group>
  );
}

export interface PlantSceneProps {
  cameraPresetKey?: string;
  cameraResetTick?: number;
  autoOrbit?: boolean;
  explodeFactor?: number;
  sectionCut?: SectionCutState;
  hiddenIds?: Record<string, boolean>;
  isolatedId?: ComponentId | null;
  selectedId?: ComponentId | null;
  hoveredId?: ComponentId | null;
  highlightedIds?: ComponentId[];
  transparentIds?: ComponentId[];
  showLabels?: boolean;
  runnerMode?: RunnerInspectionMode;
  flowMode?: FlowMode;
  guideVaneOpeningPct?: number;
  flowRateM3s?: number;
  angularSpeedRadS?: number;
  electricalPowerW?: number;
  onSelectComponent?: (id: ComponentId) => void;
  onHoverComponent?: (id: ComponentId | null) => void;
  onUserOrbitStart?: () => void;
  onTransitionSettled?: () => void;
}

export function PlantScene({
  cameraPresetKey = 'cam-preset-full-plant',
  cameraResetTick = 0,
  autoOrbit = false,
  explodeFactor = 0,
  sectionCut = { enabled: false, axis: 'z', positionPct: 50 },
  hiddenIds = {},
  isolatedId = null,
  selectedId = null,
  hoveredId = null,
  highlightedIds = [],
  transparentIds = [],
  showLabels = false,
  runnerMode = 'normal',
  flowMode = 'ambient',
  guideVaneOpeningPct = 85,
  flowRateM3s = 60,
  angularSpeedRadS = 26.18,
  electricalPowerW = 44_551_816,
  onSelectComponent,
  onHoverComponent,
  onUserOrbitStart,
  onTransitionSettled,
}: PlantSceneProps) {
  const reducedMotion = useUiStore((s) => s.reducedMotion);
  const setWebglContextLost = useUiStore((s) => s.setWebglContextLost);

  // R3F calls gl.forceContextLoss() ~500 ms after a <Canvas> unmounts (route change).
  // That intentional loss must not flip the global fallback flag, so the listener is
  // detached in this effect's cleanup, which runs before R3F's delayed disposal.
  const contextLostCleanupRef = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      contextLostCleanupRef.current?.();
      contextLostCleanupRef.current = null;
    },
    []
  );

  const clippingPlanes = useMemo(() => {
    if (!sectionCut.enabled) return [];
    const frac = sectionCut.positionPct / 100;
    if (sectionCut.axis === 'x') {
      const xVal = THREE.MathUtils.lerp(-50, 50, frac);
      return [new THREE.Plane(new THREE.Vector3(-1, 0, 0), xVal)];
    }
    if (sectionCut.axis === 'y') {
      const yVal = THREE.MathUtils.lerp(-6, 90, frac);
      return [new THREE.Plane(new THREE.Vector3(0, -1, 0), yVal)];
    }
    const zVal = THREE.MathUtils.lerp(-28, 28, frac);
    return [new THREE.Plane(new THREE.Vector3(0, 0, -1), zVal)];
  }, [sectionCut.enabled, sectionCut.axis, sectionCut.positionPct]);

  const sharedProps = {
    explodeFactor,
    hiddenIds,
    isolatedId,
    selectedId,
    hoveredId,
    highlightedIds,
    transparentIds,
    showLabels,
    clippingPlanes,
    onSelect: onSelectComponent,
    onHover: onHoverComponent,
  };

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 42, near: 0.2, far: 450, position: [48, 46, 78] }}
      gl={{ localClippingEnabled: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        const handleContextLost = (e: Event) => {
          e.preventDefault();
          setWebglContextLost(true);
        };
        canvas.addEventListener('webglcontextlost', handleContextLost, false);
        contextLostCleanupRef.current = () =>
          canvas.removeEventListener('webglcontextlost', handleContextLost, false);
      }}
    >
      <StudioLighting />
      <CutawayPlinth />

      {/* Visual clipping plane boundary frame when Section Cut active */}
      {sectionCut.enabled && clippingPlanes[0] ? (
        <mesh
          userData={{ isDecorative: true }}
          position={[
            sectionCut.axis === 'x' ? clippingPlanes[0].constant : 0,
            sectionCut.axis === 'y' ? clippingPlanes[0].constant : 12,
            sectionCut.axis === 'z' ? clippingPlanes[0].constant : 0,
          ]}
          rotation={[
            sectionCut.axis === 'y' ? Math.PI / 2 : 0,
            sectionCut.axis === 'x' ? Math.PI / 2 : 0,
            0,
          ]}
        >
          <planeGeometry args={[120, 96]} />
          <meshBasicMaterial
            color="#36C5D9"
            transparent
            opacity={0.07}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ) : null}

      <SubAReservoirDam {...sharedProps} />
      <SubBConveyance {...sharedProps} />
      <SubCTurbine
        {...sharedProps}
        guideVaneOpeningPct={guideVaneOpeningPct}
        angularSpeedRadS={angularSpeedRadS}
        reducedMotion={reducedMotion}
        runnerMode={runnerMode}
      />
      <SubDGenerator
        {...sharedProps}
        angularSpeedRadS={angularSpeedRadS}
        reducedMotion={reducedMotion}
      />
      <SubEElectrical {...sharedProps} />
      <SubFDischarge {...sharedProps} />

      <FlowVisualizers
        mode={flowMode}
        flowRateM3s={flowRateM3s}
        electricalPowerW={electricalPowerW}
        reducedMotion={reducedMotion}
      />

      <CameraRig
        presetKey={cameraPresetKey}
        resetTick={cameraResetTick}
        autoOrbit={autoOrbit}
        reducedMotion={reducedMotion}
        onUserOrbitStart={onUserOrbitStart}
        onTransitionSettled={onTransitionSettled}
      />
    </Canvas>
  );
}
