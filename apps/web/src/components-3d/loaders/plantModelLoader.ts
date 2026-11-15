import type { Object3D } from 'three';
import { COMPONENT_MAP } from '@/services/dataLoader';
import type { ComponentId } from '@/types/domain';
import manifestJson from '../../../public/models/manifest.json';

export interface ManifestComponentEntry {
  componentId: ComponentId;
  glbPath: string;
  nodeName: string;
  lodSupported: boolean;
  explodeVector: [number, number, number];
  cameraFocusOffset: [number, number, number];
  boundingRadiusM: number;
  supportsCutawayTransparency: boolean;
  defaultGeometryFallback: string;
}

export const ASSET_MANIFEST_ENTRIES = manifestJson.components as ManifestComponentEntry[];

export const ASSET_MANIFEST_MAP: Record<ComponentId, ManifestComponentEntry> =
  ASSET_MANIFEST_ENTRIES.reduce(
    (acc, entry) => {
      acc[entry.componentId] = entry;
      return acc;
    },
    {} as Record<ComponentId, ManifestComponentEntry>
  );

export function resolveComponentIdFromObject3D(obj: Object3D | null): ComponentId | null {
  let current: Object3D | null = obj;
  while (current) {
    if (current.userData?.isDecorative) {
      return null;
    }
    const cid = current.userData?.componentId;
    if (typeof cid === 'string' && cid in COMPONENT_MAP) {
      return cid as ComponentId;
    }
    current = current.parent;
  }
  return null;
}

export function getPublicModelUrl(relativeGlbPath: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = relativeGlbPath.startsWith('/') ? relativeGlbPath.slice(1) : relativeGlbPath;
  return `${normalizedBase}${normalizedPath}`;
}
