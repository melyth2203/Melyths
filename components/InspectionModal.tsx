
import React, { useState, useMemo, useEffect } from 'react';
import { getPartById, getControlPlanById, getParameterById } from '../lib/mockData';
import type { Sample, MeasurementParameter, Bubble, Measurement, ControlPlan, Part } from '../types';
import { InteractiveDrawing } from './InteractiveDrawing';
import { MeasurementChart } from './MeasurementChart';
import { TrashIcon, CloseIcon } from './icons';

// Re-usable component from Sampling.tsx, now local to the modal
const ParameterItem: React.FC<{
    param: MeasurementParameter,
    paramMeasurements: Measurement[],
    isSelected: boolean,
    onSelect: () => void,
    onAddValue: (value: number | boolean) => void,
    onDeleteValue: (measurementId: string) => void,
}> = ({ param, paramMeasurements, isSelected, onSelect, onAddValue, onDeleteValue }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newValue, setNewValue] = useState<string>('');

    const okCount = paramMeasurements.filter(m => m.isOk).length;
    const totalCount = paramMeasurements.length;
    const summaryText = totalCount > 0 ? `${okCount} / ${totalCount} OK` : 'Not Measured';

    let statusColor = 'border-gray-300 dark:border-gray-600';
    if (totalCount > 0) {
        statusColor = okCount === totalCount ? 'border-green-500' : 'border-red-500';
    }

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (param.type === 'numeric') {
            const numValue = parseFloat(newValue);
            if (!isNaN(numValue)) {
                onAddValue(numValue);
                setNewValue('');
            }
        }
    };
    
    const handleBooleanChange = (val: boolean) => onAddValue(val);

    return (
        <div className={`p-3 rounded-lg transition-all duration-200 border-2 ${isSelected ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'} ${statusColor}`}>
            <div className="flex justify-between items-center cursor-pointer" onClick={() => { onSelect(); setIsExpanded(!isExpanded); }}>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{param.name}</span>
                <div className="flex items-center gap-4">
                    <span className={`text-sm font-semibold ${totalCount > 0 && okCount < totalCount ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>{summaryText}</span>
                    <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {param.type === 'numeric' && (
                        <>
                            {paramMeasurements.length > 0 && (
                                <div className="mb-4">
                                    <table className="w-full text-xs text-left">
                                        <thead><tr><th className="py-1">Value</th><th className="py-1">Status</th><th className="py-1">Actions</th></tr></thead>
                                        <tbody>
                                            {paramMeasurements.map((m) => (
                                                <tr key={m.id}>
                                                    <td className="py-1 font-mono">{m.value?.toFixed(3)} {param.unit}</td>
                                                    <td className={`py-1 font-semibold ${m.isOk ? 'text-green-600' : 'text-red-600'}`}>{m.isOk ? 'OK' : 'NOK'}</td>
                                                    <td className="py-1"><button onClick={() => onDeleteValue(m.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <form onSubmit={handleAdd} className="flex items-center space-x-2">
                                <input type="number" step="0.001" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="Enter new value" className="flex-grow px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md"/>
                                <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">Add</button>
                            </form>
                        </>
                    )}
                    {param.type === 'boolean' && (
                         <select value={paramMeasurements[0]?.booleanValue === undefined ? '' : String(paramMeasurements[0].booleanValue)} onChange={(e) => handleBooleanChange(e.target.value === 'true')} className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                            <option value="" disabled>Select status</option>
                            <option value="true">OK</option>
                            <option value="false">NOK</option>
                        </select>
                    )}
                </div>
            )}
        </div>
    );
}

interface InspectionModalProps {
  sample: Sample;
  allParts: Part[];
  allControlPlans: ControlPlan[];
  onClose: () => void;
  onSave: (updatedSample: Sample) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({ sample, allParts, allControlPlans, onClose, onSave }) => {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setMeasurements(sample.measurements || []);
  }, [sample]);

  const part = useMemo(() => getPartById(sample.partId, allParts), [sample, allParts]);
  const controlPlan = useMemo(() => getControlPlanById(sample.controlPlanId, allControlPlans), [sample, allControlPlans]);

  if (!part || !controlPlan) {
    // This case should ideally not happen if data is consistent
    return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-4 rounded">Error: Missing data for part or plan.</div></div>;
  }
  
  const handleAddMeasurement = (paramId: string, value: number | boolean) => {
    const param = getParameterById(paramId, controlPlan);
    if (!param) return;

    let isOk = false;
    let newMeasurementData: Partial<Omit<Measurement, 'id' | 'parameterId' | 'timestamp' | 'isOk'>> = {};

    if (param.type === 'numeric' && typeof value === 'number') {
        isOk = value >= ((param.nominal || 0) - (param.tolMinus || 0)) && value <= ((param.nominal || 0) + (param.tolPlus || 0));
        newMeasurementData = { value };
    } else if (param.type === 'boolean' && typeof value === 'boolean') {
        isOk = value === param.expectedValue;
        newMeasurementData = { booleanValue: value };
    } else { return; }
    
    const newMeasurement: Measurement = { id: `M-${paramId}-${Date.now()}`, parameterId: paramId, ...newMeasurementData, isOk, timestamp: new Date().toISOString() };
    
    setMeasurements(prev => param.type === 'boolean' ? [...prev.filter(m => m.parameterId !== paramId), newMeasurement] : [...prev, newMeasurement]);
  };

  const handleDeleteMeasurement = (measurementId: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== measurementId));
  };
  
  const handleSaveAndComplete = () => {
    onSave({ ...sample, measurements, status: 'Inspection Completed' });
  };

  const selectedParameter = getParameterById(selectedParameterId || '', controlPlan);
  const measurementsForChart = measurements.filter(m => m.parameterId === selectedParameterId && m.value !== undefined);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-7xl h-[95vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Sample Inspection: {sample.id}</h2>
            <p className="text-sm text-gray-500">Part: {part.name} ({part.partCode}) | Batch: {sample.batchNumber}</p>
          </div>
          <button onClick={onClose}><CloseIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" /></button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-grow min-h-0">
          {/* Left Panel: Drawing */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="flex-grow bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md min-h-[400px]">
              <InteractiveDrawing imageUrl={controlPlan.drawingImageUrl || part.imageUrl} bubbles={bubbles} setBubbles={setBubbles} selectedParameterId={selectedParameterId} onBubbleSelect={setSelectedParameterId} />
            </div>
          </div>

          {/* Right Panel: Parameters and Chart */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col max-h-[calc(100% - 15rem)]">
              <h3 className="text-lg font-semibold mb-2">Parameters ({controlPlan.name})</h3>
              <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                {controlPlan.parameters.map(param => (
                  <ParameterItem key={param.id} param={param} paramMeasurements={measurements.filter(m => m.parameterId === param.id)} isSelected={selectedParameterId === param.id} onSelect={() => setSelectedParameterId(param.id)} onAddValue={(val) => handleAddMeasurement(param.id, val)} onDeleteValue={handleDeleteMeasurement} />
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md h-56">
              <h3 className="text-lg font-semibold mb-2">Chart: {selectedParameter?.name || 'Select a parameter'}</h3>
              {selectedParameter && selectedParameter.type === 'numeric' ? (
                <MeasurementChart measurements={measurementsForChart} parameter={selectedParameter} />
              ) : (
                <div className="flex-grow flex items-center justify-center h-full text-gray-500">{selectedParameter ? 'Chart not available for boolean parameters.' : 'Select a parameter to display the chart.'}</div>
              )}
            </div>
            <div className="flex-shrink-0">
              <button onClick={handleSaveAndComplete} className="w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
                Save and Complete Sample Inspection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
