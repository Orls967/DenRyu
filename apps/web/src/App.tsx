import { HashRouter, Route, Routes } from 'react-router-dom';
import { PLANT_CONFIG } from '@/services/dataLoader';

export function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-canvas text-text-primary p-6">
        <header className="border-b border-subtle pb-4 mb-6">
          <h1 className="font-display text-2xl font-semibold">{PLANT_CONFIG.name}</h1>
        </header>
        <Routes>
          <Route path="/" element={<div>Overview</div>} />
          <Route path="/anatomy" element={<div>Plant Anatomy</div>} />
          <Route path="/journey" element={<div>Energy Journey</div>} />
          <Route path="/simulator" element={<div>Generation Simulator</div>} />
          <Route path="/insights" element={<div>Engineering Insights</div>} />
          <Route path="/library" element={<div>Technical Library</div>} />
        </Routes>
      </div>
    </HashRouter>
  );
}
