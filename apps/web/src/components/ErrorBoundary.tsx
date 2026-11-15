import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Panel } from '@/components/ui/Primitives';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Unexpected rendering failure.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('DENRYU ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Panel className="m-4 p-6 border-status-error/50">
          <h2 className="font-display text-lg font-semibold text-status-error">
            {this.props.fallbackTitle ?? 'Module Fault'}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">{this.state.message}</p>
          <Button
            className="mt-4"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Retry Module
          </Button>
        </Panel>
      );
    }
    return this.props.children;
  }
}
