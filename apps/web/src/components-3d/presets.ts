export interface CameraPreset {
  key: string;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  'cam-preset-full-plant': {
    key: 'cam-preset-full-plant',
    label: 'Full Plant Overview',
    position: [64, 150, 120],
    target: [-22, 20, 0],
  },
  'cam-preset-overview-hero': {
    key: 'cam-preset-overview-hero',
    label: 'Overview Hero',
    position: [62, 168, 124],
    target: [-30, 22, 4],
  },
  'cam-preset-dam-overview': {
    key: 'cam-preset-dam-overview',
    label: 'Dam & Reservoir',
    position: [-150, 150, 150],
    target: [-36, 36, 0],
  },
  'cam-preset-intake-submerged': {
    key: 'cam-preset-intake-submerged',
    label: 'Submerged Intake',
    position: [-52, 66, 22],
    target: [-31, 61, -6],
  },
  'cam-preset-conveyance-profile': {
    key: 'cam-preset-conveyance-profile',
    label: 'Water Conveyance Profile',
    position: [-8, 42, 46],
    target: [-14, 34, -1],
  },
  'cam-preset-turbine-cutaway': {
    key: 'cam-preset-turbine-cutaway',
    label: 'Turbine Pit (Francis)',
    position: [8.5, 4.5, 9.5],
    target: [0, 0, 0],
  },
  'cam-preset-blade-inspection': {
    key: 'cam-preset-blade-inspection',
    label: 'Francis Blade Close-Up',
    position: [3.2, 1.4, 3.6],
    target: [0, 0, 0],
  },
  'cam-preset-shaft-coupling': {
    key: 'cam-preset-shaft-coupling',
    label: 'Main Shaft & Bearings',
    position: [6.5, 6.2, 7.2],
    target: [0, 5.2, 0],
  },
  'cam-preset-generator-hall': {
    key: 'cam-preset-generator-hall',
    label: 'Generator Hall',
    position: [9.5, 14.5, 10.5],
    target: [0, 9.8, 0],
  },
  'cam-preset-transformer-bay': {
    key: 'cam-preset-transformer-bay',
    label: 'Transformer & Busbar Bay',
    position: [26, 18, 4],
    target: [12, 8.6, -9],
  },
  'cam-preset-switchyard-grid': {
    key: 'cam-preset-switchyard-grid',
    label: 'Switchyard & Grid Line',
    position: [36, 24, 14],
    target: [34, 10, -12],
  },
  'cam-preset-tailrace-exit': {
    key: 'cam-preset-tailrace-exit',
    label: 'Draft Tube & Tailrace',
    position: [34, 8, 24],
    target: [20, -5, 0],
  },
};

export const ANATOMY_CAMERA_MENU: CameraPreset[] = [
  CAMERA_PRESETS['cam-preset-full-plant'],
  CAMERA_PRESETS['cam-preset-dam-overview'],
  CAMERA_PRESETS['cam-preset-conveyance-profile'],
  CAMERA_PRESETS['cam-preset-turbine-cutaway'],
  CAMERA_PRESETS['cam-preset-generator-hall'],
  CAMERA_PRESETS['cam-preset-switchyard-grid'],
  CAMERA_PRESETS['cam-preset-tailrace-exit'],
];
