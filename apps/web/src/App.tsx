import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { EnergyJourneyPage } from '@/features/energy-journey/EnergyJourneyPage';
import { EngineeringInsightsPage } from '@/features/insights/EngineeringInsightsPage';
import { TechnicalLibraryPage } from '@/features/library/TechnicalLibraryPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { PlantAnatomyPage } from '@/features/plant-anatomy/PlantAnatomyPage';
import { GenerationSimulatorPage } from '@/features/simulator/GenerationSimulatorPage';

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
            <Route path="/insights" element={<EngineeringInsightsPage />} />
            <Route path="/library" element={<TechnicalLibraryPage />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
}
