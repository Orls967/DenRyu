import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { OverviewPage } from '@/features/overview/OverviewPage';

function PlaceholderRoute({ title }: { title: string }) {
  return (
    <div className="p-6 text-sm text-text-secondary">
      Loading {title}...
    </div>
  );
}

export function App() {
  return (
    <HashRouter>
      <ErrorBoundary fallbackTitle="DENRYU Application Error">
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/anatomy" element={<PlaceholderRoute title="Plant Anatomy" />} />
            <Route path="/journey" element={<PlaceholderRoute title="Energy Journey" />} />
            <Route path="/simulator" element={<PlaceholderRoute title="Generation Simulator" />} />
            <Route path="/insights" element={<PlaceholderRoute title="Engineering Insights" />} />
            <Route path="/library" element={<PlaceholderRoute title="Technical Library" />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
