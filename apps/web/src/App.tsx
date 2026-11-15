import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EnergyJourneyPage } from '@/features/energy-journey/EnergyJourneyPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { PlantAnatomyPage } from '@/features/plant-anatomy/PlantAnatomyPage';
import { GenerationSimulatorPage } from '@/features/simulator/GenerationSimulatorPage';

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
            <Route path="/anatomy" element={<PlantAnatomyPage />} />
            <Route path="/journey" element={<EnergyJourneyPage />} />
            <Route path="/simulator" element={<GenerationSimulatorPage />} />
            <Route path="/insights" element={<PlaceholderRoute title="Engineering Insights" />} />
            <Route path="/library" element={<PlaceholderRoute title="Technical Library" />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
