
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { getPartById, getControlPlanById, getParameterById } from '../lib/mockData';
import type { Sample, MeasurementParameter, Bubble, Measurement, ControlPlan, Part } from '../types';
import { InteractiveDrawing } from './InteractiveDrawing';
import { MeasurementChart } from './MeasurementChart';
import { analyzeMeasurementData } from '../services/geminiService';
import { MetrologyProIcon, PlusIcon, TrashIcon } from './icons';
import { NewSampleModal } from './NewSampleModal';


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

    const handleBooleanChange = (val: boolean) => {
        // For boolean, we replace the value if it exists, as multiple boolean checks don't make sense
        onAddValue(val);
    };

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
                                        <thead>
                                            <tr>
                                                <th className="py-1">Value</th>
                                                <th className="py-1">Status</th>
                                                <th className="py-1">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paramMeasurements.map((m, index) => (
                                                <tr key={m.id}>
                                                    <td className="py-1 font-mono">{m.value?.toFixed(3)} {param.unit}</td>
                                                    <td className={`py-1 font-semibold ${m.isOk ? 'text-green-600' : 'text-red-600'}`}>{m.isOk ? 'OK' : 'NOK'}</td>
                                                    <td className="py-1">
                                                        <button onClick={() => onDeleteValue(m.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <form onSubmit={handleAdd} className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    step="0.001"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder="Enter new value"
                                    className="flex-grow px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">Add</button>
                            </form>
                        </>
                    )}
                    {param.type === 'boolean' && (
                         <select
                            value={paramMeasurements[0]?.booleanValue === undefined ? '' : String(paramMeasurements[0].booleanValue)}
                            onChange={(e) => handleBooleanChange(e.target.value === 'true')}
                            className="w-full px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
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

interface SamplingProps {
  samples: Sample[];
  setSamples: React.Dispatch<React.SetStateAction<Sample[]>>;
  allParts: Part[];
  allControlPlans: ControlPlan[];
}

export const Sampling: React.FC<SamplingProps> = ({ samples, setSamples, allParts, allControlPlans }) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(
      samples.find(s => s.status === 'In Progress')?.id || samples.find(s => s.status === 'Pending')?.id || samples[0]?.id || null
  );
  const [isNewSampleModalOpen, setIsNewSampleModalOpen] = useState(false);

  const selectedSample = useMemo(() => samples.find(s => s.id === selectedSampleId), [selectedSampleId, samples]);

  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setMeasurements(selectedSample?.measurements || []);
    setSelectedParameterId(null);
    setBubbles([]);
    setAiAnalysis('');
  }, [selectedSample]);

  const part: Part | undefined = useMemo(() => selectedSample ? getPartById(selectedSample.partId, allParts) : undefined, [selectedSample, allParts]);
  const controlPlan: ControlPlan | undefined = useMemo(() => selectedSample ? getControlPlanById(selectedSample.controlPlanId, allControlPlans) : undefined, [selectedSample, allControlPlans]);

  const handleAddMeasurement = (paramId: string, value: number | boolean) => {
    const param = getParameterById(paramId, controlPlan);
    if (!param) return;

    let isOk = false;
    let newMeasurementData: Partial<Omit<Measurement, 'id' | 'parameterId' | 'timestamp' | 'isOk'>> = {};

    if (param.type === 'numeric' && typeof value === 'number' && !isNaN(value)) {
        isOk = value >= ((param.nominal || 0) - (param.tolMinus || 0)) && value <= ((param.nominal || 0) + (param.tolPlus || 0));
        newMeasurementData = { value };
    } else if (param.type === 'boolean' && typeof value === 'boolean') {
        isOk = value === param.expectedValue;
        newMeasurementData = { booleanValue: value };
    } else {
        return;
    }
    
    const newMeasurement: Measurement = {
        id: `M-${paramId}-${Date.now()}`,
        parameterId: paramId,
        ...newMeasurementData,
        isOk,
        timestamp: new Date().toISOString()
    };
    
    setMeasurements(prev => {
        if(param.type === 'boolean') {
            // For boolean, replace existing measurement for that param
            const otherMeasurements = prev.filter(m => m.parameterId !== paramId);
            return [...otherMeasurements, newMeasurement];
        }
        return [...prev, newMeasurement];
    });
  };

  const handleDeleteMeasurement = (measurementId: string) => {
      setMeasurements(prev => prev.filter(m => m.id !== measurementId));
  };


  const handleGenerateAnalysis = useCallback(async () => {
    if (!controlPlan) return;
    setIsAnalyzing(true);
    setAiAnalysis('');
    const analysis = await analyzeMeasurementData(measurements, controlPlan.parameters);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  }, [measurements, controlPlan]);
  
  const handleSaveMeasurements = () => {
    if (!selectedSample) return;
    setSamples(prevSamples =>
      prevSamples.map(s =>
        s.id === selectedSample.id
          ? { ...s, measurements: measurements, status: 'Completed' }
          : s
      )
    );
    alert('Measurements saved and sample marked as complete.');
  };

  const handleCreateSample = (partId: string, controlPlanId: string, batchNumber: string) => {
    const newSample: Sample = {
        id: `S${Date.now()}`,
        partId,
        controlPlanId,
        batchNumber,
        createdAt: new Date().toISOString(),
        measurements: [],
        status: 'Pending',
    };
    setSamples(prev => [...prev, newSample]);
    setSelectedSampleId(newSample.id);
    setIsNewSampleModalOpen(false);
  };

  if (samples.length === 0 || !selectedSample || !part || !controlPlan) {
    return (
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg">
            <h3 className="text-xl font-semibold">No samples to measure</h3>
            <p className="text-gray-500 mb-4">Create a new sample to start measurement.</p>
            <button
              onClick={() => setIsNewSampleModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mx-auto"
            >
              <PlusIcon className="h-5 w-5" />
              Create New Sample
            </button>
            {isNewSampleModalOpen && (
                <NewSampleModal
                    parts={allParts}
                    controlPlans={allControlPlans}
                    onClose={() => setIsNewSampleModalOpen(false)}
                    onCreate={handleCreateSample}
                />
            )}
        </div>
    );
  }

  const selectedParameter = getParameterById(selectedParameterId || '', controlPlan);
  const measurementsForChart = measurements.filter(m => m.parameterId === selectedParameterId && m.value !== undefined);
  
  return (
    <>
    <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Left Panel: Drawing and Info */}
        <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="flex justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-semibold">{part.name} - Sample Measurement</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Drawing: {part.drawingNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={selectedSampleId || ''}
                            onChange={(e) => setSelectedSampleId(e.target.value)}
                            className="p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600"
                        >
                            {samples.map(s => <option key={s.id} value={s.id}>{s.id} ({s.status})</option>)}
                        </select>
                        <button onClick={() => setIsNewSampleModalOpen(true)} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                           <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex-grow bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md min-h-[400px]">
                <InteractiveDrawing 
                    imageUrl={controlPlan.drawingImageUrl || part.imageUrl}
                    bubbles={bubbles}
                    setBubbles={setBubbles}
                    selectedParameterId={selectedParameterId}
                    onBubbleSelect={setSelectedParameterId}
                />
            </div>
        </div>

        {/* Right Panel: Parameters and Chart */}
        <div className="lg:w-1/2 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col max-h-[calc(50%-1.5rem)]">
                <h3 className="text-lg font-semibold mb-2">Measurement Parameters ({controlPlan.name})</h3>
                <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                    {controlPlan.parameters.map(param => {
                        const paramMeasurements = measurements.filter(m => m.parameterId === param.id);
                        return (
                            <ParameterItem
                                key={param.id}
                                param={param}
                                paramMeasurements={paramMeasurements}
                                isSelected={selectedParameterId === param.id}
                                onSelect={() => setSelectedParameterId(param.id)}
                                onAddValue={(val) => handleAddMeasurement(param.id, val)}
                                onDeleteValue={handleDeleteMeasurement}
                            />
                        )
                    })}
                </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col max-h-[calc(50%-1.5rem)]">
                <h3 className="text-lg font-semibold mb-2">Measurement Chart: {selectedParameter?.name || 'Select a parameter'}</h3>
                {selectedParameter && selectedParameter.type === 'numeric' ? (
                    <MeasurementChart measurements={measurementsForChart} parameter={selectedParameter} />
                ) : (
                    <div className="flex-grow flex items-center justify-center h-full text-gray-500">
                      {selectedParameter ? 'Chart is not available for boolean parameters.' : 'Select a parameter to display the chart.'}
                    </div>
                )}
            </div>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-2">Evaluation & AI Analysis</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveMeasurements}
                    disabled={selectedSample.status === 'Completed'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Save Measurements & Complete
                  </button>
                  <button 
                    onClick={handleGenerateAnalysis}
                    disabled={isAnalyzing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'AI Analysis (Gemini)'}
                  </button>
                </div>
                {aiAnalysis && (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm prose dark:prose-invert">
                    {aiAnalysis.split('\n').map((line, i) => <p key={i}>{line.replace(/\*\*/g, '').replace(/\*/g, '•')}</p>)}
                  </div>
                )}
                 {isAnalyzing && (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-300">
                        <MetrologyProIcon className="h-5 w-5 animate-spin"/>
                        <span>Contacting Gemini expert...</span>
                    </div>
                )}
            </div>
        </div>
    </div>
    {isNewSampleModalOpen && (
        <NewSampleModal
            parts={allParts}
            controlPlans={allControlPlans}
            onClose={() => setIsNewSampleModalOpen(false)}
            onCreate={handleCreateSample}
        />
    )}
    </>
  );
};
