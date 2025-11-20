
import React, { useState } from 'react';
import type { Part, ControlPlan, Sample } from '../types';
import { ReceivingIcon } from './icons';

interface ReceivingProps {
  parts: Part[];
  controlPlans: ControlPlan[];
  setInspectionSamples: React.Dispatch<React.SetStateAction<Sample[]>>;
}

export const Receiving: React.FC<ReceivingProps> = ({ parts, controlPlans, setInspectionSamples }) => {
  const [partCode, setPartCode] = useState('');
  const [sampleCount, setSampleCount] = useState(3);
  const [batchNumber, setBatchNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const part = parts.find(p => p.partCode.toLowerCase() === partCode.toLowerCase() && p.status === 'Active');
    if (!part) {
      alert(`No active part found with code "${partCode}".`);
      return;
    }

    const latestActivePlan = controlPlans
        .filter(p => p.partId === part.id && p.status === 'Active')
        .sort((a, b) => b.version - a.version)[0];
    
    if (!latestActivePlan) {
      alert(`No active control plan found for part "${part.name}".`);
      return;
    }

    const newSamples: Sample[] = [];
    for (let i = 0; i < sampleCount; i++) {
        newSamples.push({
            id: `INSP-${Date.now()}-${i}`,
            partId: part.id,
            controlPlanId: latestActivePlan.id,
            batchNumber: batchNumber || `BATCH-${Date.now()}`,
            createdAt: new Date().toISOString(),
            measurements: [],
            status: 'Inspection Pending',
        });
    }

    setInspectionSamples(prev => [...prev, ...newSamples]);

    alert(`${sampleCount} inspection samples for part "${part.name}" were successfully created and moved to Incoming Inspection.`);
    
    // Reset form
    setPartCode('');
    setBatchNumber('');
    setSampleCount(3);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Material Receiving</h2>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-lg mx-auto">
        <div className="flex items-center mb-6">
            <ReceivingIcon className="h-10 w-10 text-blue-500 mr-4" />
            <div>
                <h3 className="text-xl font-semibold">Create Inspection Samples</h3>
                <p className="text-gray-500 text-sm">Enter the code of the received part to generate an inspection.</p>
            </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="partCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Part Code</label>
            <input
              type="text"
              id="partCode"
              value={partCode}
              onChange={(e) => setPartCode(e.target.value)}
              placeholder="e.g., PN-1001"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
            />
          </div>
          <div>
            <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number / Delivery Note</label>
            <input
              type="text"
              id="batchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="e.g., DEL-ACME-0824"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
            />
          </div>
          <div>
            <label htmlFor="sampleCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Samples to Inspect</label>
            <input
              type="number"
              id="sampleCount"
              value={sampleCount}
              onChange={(e) => setSampleCount(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 p-2"
            />
          </div>
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Samples and Move to Inspection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
