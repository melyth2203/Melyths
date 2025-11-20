
import React, { useState, useMemo } from 'react';
import { getPartById } from '../lib/mockData';
import type { Sample, Part, ControlPlan } from '../types';
import { InspectionIcon } from './icons';
import { InspectionModal } from './InspectionModal';

interface IncomingInspectionProps {
  inspectionSamples: Sample[];
  setInspectionSamples: React.Dispatch<React.SetStateAction<Sample[]>>;
  allParts: Part[];
  allControlPlans: ControlPlan[];
}

export const IncomingInspection: React.FC<IncomingInspectionProps> = ({
  inspectionSamples,
  setInspectionSamples,
  allParts,
  allControlPlans,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);

  const pendingInspectionSamples = useMemo(
    () => inspectionSamples.filter((s) => s.status === 'Inspection Pending'),
    [inspectionSamples]
  );

  const handleStartInspection = (sample: Sample) => {
    setSelectedSample(sample);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedSample(null);
    setIsModalOpen(false);
  };

  const handleSaveChanges = (updatedSample: Sample) => {
    setInspectionSamples((prevSamples) =>
      prevSamples.map((s) => (s.id === updatedSample.id ? updatedSample : s))
    );
    handleCloseModal();
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Incoming Part Inspection</h2>

      {pendingInspectionSamples.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-md text-center">
          <InspectionIcon className="h-16 w-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">All inspections are complete</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Create new inspection samples in the "Receiving" module.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Sample ID</th>
                  <th scope="col" className="px-6 py-3">Part Name</th>
                  <th scope="col" className="px-6 py-3">Batch / Delivery</th>
                  <th scope="col" className="px-6 py-3">Creation Date</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingInspectionSamples.map((sample) => {
                  const part = getPartById(sample.partId, allParts);
                  return (
                    <tr key={sample.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="px-6 py-4 font-mono">{sample.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{part?.name ?? 'Unknown Part'}</td>
                      <td className="px-6 py-4">{sample.batchNumber}</td>
                      <td className="px-6 py-4">{new Date(sample.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStartInspection(sample)}
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Inspection
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && selectedSample && (
        <InspectionModal
          sample={selectedSample}
          allParts={allParts}
          allControlPlans={allControlPlans}
          onClose={handleCloseModal}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};
