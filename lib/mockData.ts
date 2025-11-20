import { Part, Gauge, ControlPlan, Sample, MeasurementParameter, Measurement } from '../types';

export const mockParts: Part[] = [
  { id: 'P001', partCode: 'PN-1001', name: 'Main Gear', drawingNumber: 'DWG-10-22-001', material: 'Steel 4140', imageUrl: 'https://picsum.photos/seed/gear/800/600', revision: 1, status: 'Active' },
  { id: 'P002', partCode: 'PN-2351', name: 'Connector Housing', drawingNumber: 'DWG-12-05-012', material: 'ABS Plastic', imageUrl: 'https://picsum.photos/seed/housing/800/600', revision: 2, status: 'Active' },
  { id: 'P003', partCode: 'PN-4598', name: 'Mounting Bracket', drawingNumber: 'DWG-08-11-045', material: 'Aluminum 6061', imageUrl: 'https://picsum.photos/seed/bracket/800/600', revision: 1, status: 'Active' },
  { id: 'P004', partCode: 'PN-4598-OLD', name: 'Archived Bracket', drawingNumber: 'DWG-08-11-045-OLD', material: 'Aluminum 6061', imageUrl: 'https://picsum.photos/seed/bracket_old/800/600', revision: 0, status: 'Archived' },
];

export const mockGauges: Gauge[] = [
  { id: 'G01', name: 'Digital Caliper', type: 'Caliper', serialNumber: 'SN-DC-12345', lastCalibration: '2024-05-10', nextCalibration: '2025-05-10', status: 'Active' },
  { id: 'G02', name: 'Micrometer', type: 'Micrometer', serialNumber: 'SN-MC-67890', lastCalibration: '2024-07-20', nextCalibration: '2024-09-20', status: 'Due for Calibration' },
  { id: 'G03', name: 'Height Gauge', type: 'Height Gauge', serialNumber: 'SN-HG-11223', lastCalibration: '2023-11-01', nextCalibration: '2024-11-01', status: 'Active' },
  { id: 'G04', name: 'CMM Machine', type: 'CMM', serialNumber: 'SN-CMM-001', lastCalibration: '2024-02-15', nextCalibration: '2025-02-15', status: 'Active' },
];

export const mockParameters: MeasurementParameter[] = [
    { id: 'MP001', name: 'Outer Diameter', type: 'numeric', nominal: 50.00, tolPlus: 0.05, tolMinus: 0.05, unit: 'mm' },
    { id: 'MP002', name: 'Inner Bore', type: 'numeric', nominal: 25.00, tolPlus: 0.02, tolMinus: 0.02, unit: 'mm' },
    { id: 'MP003', name: 'Overall Length', type: 'numeric', nominal: 120.00, tolPlus: 0.1, tolMinus: 0.1, unit: 'mm' },
    { id: 'MP004', name: 'Flange Thickness', type: 'numeric', nominal: 10.00, tolPlus: 0.03, tolMinus: 0.03, unit: 'mm' },
    { id: 'MP005', name: 'Hole Position X', type: 'numeric', nominal: 35.5, tolPlus: 0.05, tolMinus: 0.05, unit: 'mm' },
    { id: 'MP006', name: 'Hole Position Y', type: 'numeric', nominal: 35.5, tolPlus: 0.05, tolMinus: 0.05, unit: 'mm' },
    { id: 'MP007', name: 'Visual Check: Burrs', type: 'boolean', expectedValue: false }, // Should be false (no burrs) to be OK
    { id: 'MP008', name: 'Logo Present', type: 'boolean', expectedValue: true }, // Should be true (logo is there) to be OK
];

export const mockControlPlans: ControlPlan[] = [
  { id: 'CP01', partId: 'P001', name: 'Main Gear - Production Plan', version: 2, parameters: mockParameters, status: 'Active', drawingImageUrl: 'https://picsum.photos/seed/drawing1/800/600' },
  { id: 'CP02', partId: 'P002', name: 'Connector Housing - First Article', version: 1, parameters: [mockParameters[2], mockParameters[3], mockParameters[7]], status: 'Active' },
  { id: 'CP03', partId: 'P001', name: 'Main Gear - Production Plan', version: 1, parameters: mockParameters.slice(0,5), status: 'Archived' },
];

const generateMeasurements = (params: MeasurementParameter[]): Measurement[] => {
    const allMeasurements: Measurement[] = [];
    params.forEach(p => {
        // For numeric params, generate 1 to 3 measurements. For boolean, always 1.
        const measurementCount = p.type === 'numeric' && Math.random() > 0.3 ? Math.floor(Math.random() * 3) + 1 : 1;

        for (let i = 0; i < measurementCount; i++) {
            const measurementId = `M-${p.id}-${Date.now()}-${Math.random()}`;
            if (p.type === 'numeric') {
                const value = (p.nominal || 0) + (Math.random() - 0.5) * ((p.tolPlus || 0) + (p.tolMinus || 0)) * 1.5;
                const isOk = value >= ((p.nominal || 0) - (p.tolMinus || 0)) && value <= ((p.nominal || 0) + (p.tolPlus || 0));
                allMeasurements.push({
                    id: measurementId,
                    parameterId: p.id,
                    value: parseFloat(value.toFixed(3)),
                    timestamp: new Date().toISOString(),
                    isOk
                });
            } else { // boolean
                const booleanValue = Math.random() > 0.3; // 70% chance to be true
                const isOk = booleanValue === p.expectedValue;
                allMeasurements.push({
                    id: measurementId,
                    parameterId: p.id,
                    booleanValue,
                    timestamp: new Date().toISOString(),
                    isOk
                });
            }
        }
    });
    return allMeasurements;
};


export const mockSamples: Sample[] = [
    { id: 'S001', partId: 'P001', controlPlanId: 'CP01', batchNumber: 'B-2024-001', createdAt: '2024-07-29T10:00:00Z', measurements: generateMeasurements(mockParameters), status: 'Completed' },
    { id: 'S002', partId: 'P001', controlPlanId: 'CP01', batchNumber: 'B-2024-001', createdAt: '2024-07-29T11:00:00Z', measurements: [], status: 'In Progress' },
    { id: 'S003', partId: 'P001', controlPlanId: 'CP01', batchNumber: 'B-2024-002', createdAt: '2024-07-30T09:00:00Z', measurements: [], status: 'Pending' },
];

export const mockInspectionSamples: Sample[] = [
    { id: 'INSP-001', partId: 'P002', controlPlanId: 'CP02', batchNumber: 'DOD-ACME-0824-1', createdAt: '2024-08-01T14:00:00Z', measurements: [], status: 'Inspection Pending' },
    { id: 'INSP-002', partId: 'P002', controlPlanId: 'CP02', batchNumber: 'DOD-ACME-0824-1', createdAt: '2024-08-01T14:01:00Z', measurements: [], status: 'Inspection Pending' },
];


export const getPartById = (id: string, allParts: Part[]) => allParts.find(p => p.id === id);
export const getControlPlanById = (id: string, allPlans: ControlPlan[]) => allPlans.find(cp => cp.id === id);

// This needs to search all mock parameters
export const getParameterById = (id: string, plan?: ControlPlan | null) => {
    if (plan) {
        return plan.parameters.find(p => p.id === id);
    }
    // Fallback to global list if no plan provided, though this might not be robust
    return mockParameters.find(p => p.id === id);
};