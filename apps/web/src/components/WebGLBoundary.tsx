import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useUiStore } from '@/stores/uiStore';
import { PlantSchematic2DFallback } from '@/components/PlantSchematic2DFallback';
import type { ComponentId } from '@/types/domain';

interface BoundaryProps {
  children: ReactNode;
  selectedComponentId?: ComponentId | null;
  highlightedComponentIds?: ComponentId[];
  onSelectComponent?: (id: ComponentId) => void;
}

interface BoundaryState {
  hasError: boolean;
}

class WebGLErrorCatcher extends Component<
  BoundaryProps & { onErrorTrigger?: () => void },
  BoundaryState
> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('WebGL3D fallback engaged:', error.message, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <PlantSchematic2DFallback
          selectedComponentId={this.props.selectedComponentId}
          highlightedComponentIds={this.props.highlightedComponentIds}
          onSelectComponent={this.props.onSelectComponent}
          reason="WebGL context creation failed — switched cleanly to interactive 2D schematic."
        />
      );
    }
    return this.props.children;
  }
}

export function WebGLBoundary({
  children,
  selectedComponentId,
  highlightedComponentIds,
  onSelectComponent,
}: BoundaryProps) {
  const webglSupported = useUiStore((s) => s.webglSupported);
  const webglContextLost = useUiStore((s) => s.webglContextLost);

  if (!webglSupported || webglContextLost) {
    return (
      <PlantSchematic2DFallback
        selectedComponentId={selectedComponentId}
        highlightedComponentIds={highlightedComponentIds}
        onSelectComponent={onSelectComponent}
        reason={
          webglContextLost
            ? 'WebGL context lost — displaying interactive 2D plant schematic.'
            : 'WebGL2 unavailable in this browser environment — interactive 2D schematic active.'
        }
      />
    );
  }

  return (
    <WebGLErrorCatcher
      selectedComponentId={selectedComponentId}
      highlightedComponentIds={highlightedComponentIds}
      onSelectComponent={onSelectComponent}
    >
      {children}
    </WebGLErrorCatcher>
  );
}
