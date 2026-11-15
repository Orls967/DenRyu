import { describe, expect, it, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EnergyJourneyPage } from '@/features/energy-journey/EnergyJourneyPage';
import { useJourneyStore } from '@/stores/journeyStore';
import { JOURNEY_STAGES } from '@/services/dataLoader';

describe('Guided Energy Journey (/journey)', () => {
  beforeEach(() => {
    act(() => {
      useJourneyStore.getState().replay();
      useJourneyStore.getState().pause();
    });
  });

  it('traverses all 9 stages linearly and supports Stage 04 Runner CTA & Stage 09 replay', () => {
    render(
      <MemoryRouter>
        <EnergyJourneyPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Stage 01 \/ 09/)).toBeInTheDocument();
    const nextBtn = screen.getByLabelText('Next journey stage');

    for (let idx = 1; idx < JOURNEY_STAGES.length; idx++) {
      fireEvent.click(nextBtn);
      expect(screen.getByText(new RegExp(`Stage 0${idx + 1} / 09`))).toBeInTheDocument();
      if (JOURNEY_STAGES[idx].id === 'stage-04-turbine-conversion') {
        expect(screen.getByText('Inspect Francis Runner in 5 Interactive Modes')).toBeInTheDocument();
      }
    }

    expect(screen.getByText('Complete 9-Stage Energy Loop Reached')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Replay Journey' }));
    expect(screen.getByText(/Stage 01 \/ 09/)).toBeInTheDocument();
  });

  it('reveals Re-center Stage Camera when user orbits the 3D scene manually', () => {
    render(
      <MemoryRouter>
        <EnergyJourneyPage />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('button', { name: 'Re-center Stage Camera' })).not.toBeInTheDocument();
    act(() => {
      useJourneyStore.getState().setUserCameraOverride(true);
    });
    const recenterBtn = screen.getByRole('button', { name: 'Re-center Stage Camera' });
    expect(recenterBtn).toBeInTheDocument();

    fireEvent.click(recenterBtn);
    expect(useJourneyStore.getState().userCameraOverride).toBe(false);
  });
});
