import { describe, expect, it, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HierarchyTree } from '@/features/plant-anatomy/HierarchyTree';
import { AnatomyToolbar } from '@/features/plant-anatomy/AnatomyToolbar';
import { ComponentInspector } from '@/features/plant-anatomy/ComponentInspector';
import { useAnatomyStore } from '@/stores/anatomyStore';

describe('Plant Anatomy Workspace', () => {
  beforeEach(() => {
    act(() => {
      useAnatomyStore.getState().resetAnatomyView();
      useAnatomyStore.getState().selectComponent('comp-runner');
      useAnatomyStore.getState().setSearchQuery('');
    });
  });

  it('filters all 36 components in HierarchyTree and updates selection', () => {
    render(<HierarchyTree />);
    expect(screen.getByText('Plant Hierarchy (36)')).toBeInTheDocument();

    const search = screen.getByLabelText('Search plant components');
    fireEvent.change(search, { target: { value: 'Spiral' } });
    expect(screen.getByText('Spiral Casing')).toBeInTheDocument();
    expect(screen.queryByText('Surge Tank')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Spiral Casing'));
    expect(useAnatomyStore.getState().selectedComponentId).toBe('comp-spiral-casing');
  });

  it('shows 5-mode Francis Runner inspection bar only for runner components', () => {
    render(<AnatomyToolbar />);
    expect(screen.getByRole('region', { name: 'Francis Runner Inspection Modes' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Blade Close-Up' }));
    expect(useAnatomyStore.getState().runnerMode).toBe('blade_inspection');
    expect(useAnatomyStore.getState().isolatedComponentId).toBe('comp-runner-blades');

    act(() => {
      useAnatomyStore.getState().selectComponent('comp-penstock');
    });
    expect(screen.queryByRole('region', { name: 'Francis Runner Inspection Modes' })).not.toBeInTheDocument();
  });

  it('renders all 7 inspector tabs and navigates upstream/downstream relations', () => {
    render(
      <MemoryRouter>
        <ComponentInspector />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Runner' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Parameters' }));
    expect(screen.getByText('Synthetic Baseline')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Failure & Maint.' }));
    expect(screen.getByText('Potential Failure Modes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Relations' }));
    const guideVanesBtn = screen.getByRole('button', { name: 'Guide Vanes / Wicket Gates' });
    expect(guideVanesBtn).toBeInTheDocument();
    fireEvent.click(guideVanesBtn);
    expect(useAnatomyStore.getState().selectedComponentId).toBe('comp-guide-vanes');
  });
});
