
import React, { useState, useMemo, useEffect } from 'react';
import type { Part, ControlPlan } from '../types';
import { CloseIcon } from './icons';

interface NewSampleModalProps {
  parts: Part[];
  controlPlans: ControlPlan[];
  onClose: () => void;
  onCreate: (partId: string, controlPlanId: string, batchNumber: string) => void;
}

export const NewSampleModal: React.FC<NewSampleModalProps> = ({ parts, controlPlans, onClose, onCreate }) => {
  const activeParts = useMemo(() => parts.filter(p => p.status === 'Active'), [parts]);
  const [selectedPartId, setSelectedPartId] = useState<string>(activeParts[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');

  const availablePlans = useMemo(() => {
    return controlPlans.filter(plan => plan.partId === selectedPartId && plan.status === 'Active');
  }, [selectedPartId, controlPlans]);

  // Effect to reset plan selection when part changes
  useEffect(() => {
    setSelectedPlanId(availablePlans[0]?.id || '');
  }, [selectedPartId, availablePlans]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId || !selectedPlanId || !batchNumber.trim()) {
      alert('Please fill in all fields.');
      return;
    }
    onCreate(selectedPartId, selectedPlanId, batchNumber);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Create New Sample</h2>
          <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="part" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Part</label>
            <select
              id="part"
              value={selectedPartId}
              onChange={(e) => setSelectedPartId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              {activeParts.map(part => (
                <option key={part.id} value={part.id}>{part.name} (Rev. {part.revision})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Control Plan</label>
            <select
              id="plan"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              disabled={availablePlans.length === 0}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              {availablePlans.length > 0 ? (
                availablePlans.map(plan => (
                  <option key={plan.id} value={plan.id}>{plan.name} (v{plan.version})</option>
                ))
              ) : (
                <option>No active plan available for this part</option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="batchNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Batch Number</label>
            <input
              type="text"
              id="batchNumber"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};
