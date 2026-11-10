import { Component, type ErrorInfo, type ReactNode } from 'react';

/** Si algo de la interfaz falla, se ofrece recargar en lugar de dejar la página en blanco. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-paper p-8 text-center">
        <div className="max-w-sm">
          <p className="display text-2xl">Algo no ha ido bien</p>
          <p className="mt-2 text-ink-soft">Tu progreso está a salvo. Recarga la página para seguir.</p>
          <button type="button" onClick={() => window.location.reload()} className="btn btn-primary mt-5">
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
