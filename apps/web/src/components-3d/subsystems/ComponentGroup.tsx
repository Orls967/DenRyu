import { useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { COMPONENT_MAP } from '@/services/dataLoader';
import { ASSET_MANIFEST_MAP } from '@/components-3d/loaders/plantModelLoader';
import type { ComponentId } from '@/types/domain';

export interface ComponentGroupRenderState {
  isSelected: boolean;
  isHovered: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isTransparent: boolean;
  opacityOverride: number | null;
  emissiveColor: string;
  emissiveIntensity: number;
}

export function ComponentGroup({
  componentId,
  basePosition = [0, 0, 0],
  explodeFactor = 0,
  hidden = false,
  isolatedId = null,
  selectedId = null,
  hoveredId = null,
  highlightedIds = [],
  transparentIds = [],
  showLabel = false,
  onSelect,
  onHover,
  children,
}: {
  componentId: ComponentId;
  basePosition?: [number, number, number];
  explodeFactor?: number;
  hidden?: boolean;
  isolatedId?: ComponentId | null;
  selectedId?: ComponentId | null;
  hoveredId?: ComponentId | null;
  highlightedIds?: ComponentId[];
  transparentIds?: ComponentId[];
  showLabel?: boolean;
  onSelect?: (id: ComponentId) => void;
  onHover?: (id: ComponentId | null) => void;
  children: ReactNode | ((state: ComponentGroupRenderState) => ReactNode);
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointerDownRef = useRef<{ x: number; y: number } | null>(null);
  const manifest = ASSET_MANIFEST_MAP[componentId];
  const meta = COMPONENT_MAP[componentId];

  const isSelected = selectedId === componentId;
  const isHovered = hoveredId === componentId;
  const isHighlighted = highlightedIds.includes(componentId);
  const isTransparent = transparentIds.includes(componentId);

  // If another component is isolated, dim unrelated parts (special exception: keep comp-runner visible during blade inspection context? No, blade_inspection isolates blades or runner)
  const isDimmed = Boolean(
    isolatedId &&
      isolatedId !== componentId &&
      !(isolatedId === 'comp-runner-blades' && componentId === 'comp-runner')
  );

  const explodeVec = manifest?.explodeVector ?? [0, 0, 0];
  const targetX = basePosition[0] + explodeVec[0] * explodeFactor;
  const targetY = basePosition[1] + explodeVec[1] * explodeFactor;
  const targetZ = basePosition[2] + explodeVec[2] * explodeFactor;

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    const t = Math.min(1, delta * 9);
    g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, t);
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, t);
    g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, t);
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (isDimmed) return;
    if (pointerDownRef.current) {
      const dx = e.clientX - pointerDownRef.current.x;
      const dy = e.clientY - pointerDownRef.current.y;
      if (Math.hypot(dx, dy) > 5) return;
    }
    onSelect?.(componentId);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (isDimmed) return;
    document.body.style.cursor = 'pointer';
    onHover?.(componentId);
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'auto';
    if (hoveredId === componentId) {
      onHover?.(null);
    }
  };

  const emissiveColor = isSelected
    ? '#36C5D9'
    : isHovered
      ? '#36C5D9'
      : isHighlighted
        ? '#F5B942'
        : '#000000';
  const emissiveIntensity = isSelected ? 0.45 : isHovered ? 0.25 : isHighlighted ? 0.22 : 0;

  const opacityOverride = isDimmed ? 0.08 : isTransparent ? 0.22 : null;

  const renderState: ComponentGroupRenderState = {
    isSelected,
    isHovered,
    isHighlighted,
    isDimmed,
    isTransparent,
    opacityOverride,
    emissiveColor,
    emissiveIntensity,
  };

  return (
    <group
      ref={groupRef}
      name={manifest?.nodeName ?? componentId}
      userData={{ componentId }}
      visible={!hidden}
      position={basePosition}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {typeof children === 'function' ? children(renderState) : children}

      {(showLabel || isSelected) && !hidden && !isDimmed && meta ? (
        <Html
          center
          distanceFactor={26}
          zIndexRange={[10, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`whitespace-nowrap rounded border px-1.5 py-0.5 text-[10px] font-mono shadow-md ${
              isSelected
                ? 'border-cyan-accent bg-canvas/95 text-cyan-accent'
                : 'border-subtle bg-surface/90 text-text-primary'
            }`}
          >
            {meta.officialName}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function matOpacityProps(state: ComponentGroupRenderState, defaultOpacity = 1) {
  const opacity = state.opacityOverride ?? defaultOpacity;
  const transparent = opacity < 0.99;
  return {
    transparent,
    opacity,
    depthWrite: !transparent,
    emissive: state.emissiveColor,
    emissiveIntensity: state.emissiveIntensity,
  };
}
