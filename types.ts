export interface Part {
  id: string;
  name: string;
  partCode: string;
  drawingNumber: string;
  material: string;
  imageUrl: string;
  revision: number;
  status: 'Active' | 'Archived';
}

export interface Gauge {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  lastCalibration: string;
  nextCalibration: string;
  status: 'Active' | 'Inactive' | 'Due for Calibration';
}

export interface MeasurementParameter {
  id: string;
  name: string;
  type: 'numeric' | 'boolean';
  // For numeric type
  nominal?: number;
  tolPlus?: number;
  tolMinus?: number;
  unit?: string;
  // For boolean type
  expectedValue?: boolean; // true means the measured value must be true to be "OK"
}

export interface ControlPlan {
  id: string;
  partId: string;
  name: string;
  version: number;
  parameters: MeasurementParameter[];
  status: 'Active' | 'Archived';
  drawingImageUrl?: string;
}

export interface Measurement {
  id: string;
  parameterId: string;
  value?: number; // For numeric
  booleanValue?: boolean; // For boolean
  timestamp: string;
  isOk: boolean;
}

export interface Sample {
    id: string;
    partId: string;
    controlPlanId: string;
    batchNumber: string;
    createdAt: string;
    measurements: Measurement[];
    status: 'Pending' | 'In Progress' | 'Completed' | 'Inspection Pending' | 'Inspection Completed';
}

export interface Bubble {
  id: number;
  x: number;
  y: number;
  parameterId: string;
}