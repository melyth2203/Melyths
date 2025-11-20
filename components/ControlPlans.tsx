
import React, { useState } from 'react';
import type { ControlPlan, Part, MeasurementParameter } from '../types';
import { PlusIcon, EditIcon, CloseIcon, RevisionIcon, ArchiveIcon, RestoreIcon, TrashIcon, InfoIcon } from './icons';

// --- Parameter Editor Modal (unchanged but required) ---
const ParameterModal: React.FC<{
  parameter: MeasurementParameter | null;
  onSave: (parameter: MeasurementParameter) => void;
  onClose: () => void;
}> = ({ parameter, onSave, onClose }) => {
  const [formData, setFormData] = useState<MeasurementParameter>(
    parameter || {
      id: '', name: '', type: 'numeric', nominal: 0, tolPlus: 0, tolMinus: 0, unit: 'mm', expectedValue: true,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;
    if (type === 'number') finalValue = parseFloat(value);
    if (name === 'expectedValue') finalValue = value === 'true';

    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">{parameter ? 'Edit Parameter' : 'New Parameter'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Parameter Name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option value="numeric">Numeric</option>
            <option value="boolean">Boolean</option>
          </select>
          {formData.type === 'numeric' && (
            <>
              <div className="flex items-center gap-2">
                <input type="number" step="any" name="nominal" placeholder="Nominal Value" value={formData.nominal ?? ''} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                <div title="The target value from which tolerances are calculated.">
                    <InfoIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" step="any" name="tolPlus" placeholder="Tolerance +" value={formData.tolPlus ?? ''} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                <div title="The maximum allowed positive deviation from the nominal value.">
                    <InfoIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="number" step="any" name="tolMinus" placeholder="Tolerance -" value={formData.tolMinus ?? ''} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                <div title="The maximum allowed negative deviation from the nominal value.">
                    <InfoIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <input type="text" name="unit" placeholder="Unit (mm, in, °)" value={formData.unit ?? ''} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
            </>
          )}
          {formData.type === 'boolean' && (
            <div>
              <label className="block text-sm font-medium">Expected State for "OK"</label>
              <select name="expectedValue" value={String(formData.expectedValue)} onChange={handleChange} className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                <option value="true">YES / OK / True</option>
                <option value="false">NO / NOK / False</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Parameter</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Control Plan Editor Modal ---
const ControlPlanEditorModal: React.FC<{
  plan: ControlPlan | null,
  parts: Part[],
  onSave: (plan: ControlPlan) => void,
  onClose: () => void,
}> = ({ plan, parts, onSave, onClose }) => {
  const [formData, setFormData] = useState<Omit<ControlPlan, 'id' | 'status'>>(plan || {
    partId: parts.find(p => p.status === 'Active')?.id || '', name: '', version: 1, parameters: [], drawingImageUrl: ''
  });
  const [isParameterModalOpen, setIsParameterModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<MeasurementParameter | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'version' ? parseInt(value) : value }));
  };

  const handleSaveParameter = (parameter: MeasurementParameter) => {
    if (editingParameter) {
      setFormData(prev => ({ ...prev, parameters: prev.parameters.map(p => p.id === parameter.id ? parameter : p)}));
    } else {
      const newParameter = {...parameter, id: `MP${Date.now()}`};
      setFormData(prev => ({ ...prev, parameters: [...prev.parameters, newParameter]}));
    }
    setIsParameterModalOpen(false);
    setEditingParameter(null);
  };

  const handleDeleteParameter = (paramId: string) => {
      if (window.confirm('Are you sure you want to delete this parameter?')) {
          setFormData(prev => ({ ...prev, parameters: prev.parameters.filter(p => p.id !== paramId)}));
      }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (plan) {
        onSave({ ...plan, ...formData });
    } else {
        onSave({ ...formData, id: `CP${Date.now()}`, status: 'Active' });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{plan ? `Edit Plan (v${plan.version})` : 'New Control Plan'}</h2>
            <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
          </div>
          <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="partId" value={formData.partId} onChange={handleChange} className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
                  {parts.filter(p => p.status === 'Active').map(p => <option key={p.id} value={p.id}>{p.name} (Rev. {p.revision})</option>)}
                </select>
                <input type="text" name="name" placeholder="Plan Name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
            </div>
            
            {/* Drawing Management Section */}
            <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Interactive Drawing</h3>
                <div className="flex gap-4 items-center">
                    <div className="w-1/3 h-24 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                        {formData.drawingImageUrl ? (
                            <img src={formData.drawingImageUrl} alt="Drawing Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-xs text-gray-500">No Drawing</span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, drawingImageUrl: `https://picsum.photos/seed/drawing${Date.now()}/800/600` }))}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                        Upload / Change Drawing
                    </button>
                </div>
            </div>

            <div className="pt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Parameters</h3>
                     <button type="button" onClick={() => { setEditingParameter(null); setIsParameterModalOpen(true); }} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <PlusIcon className="h-4 w-4" /> Add Parameter
                    </button>
                </div>
                <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-2">Name</th>
                                <th scope="col" className="px-4 py-2">Nominal</th>
                                <th scope="col" className="px-4 py-2">Tol+</th>
                                <th scope="col" className="px-4 py-2">Tol-</th>
                                <th scope="col" className="px-4 py-2">Unit</th>
                                <th scope="col" className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.parameters.map(p => (
                                <tr key={p.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 last:border-b-0">
                                    <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    {p.type === 'numeric' ? (
                                        <>
                                            <td className="px-4 py-2 font-mono">{p.nominal?.toFixed(3)}</td>
                                            <td className="px-4 py-2 text-green-500 font-mono">+{p.tolPlus?.toFixed(3)}</td>
                                            <td className="px-4 py-2 text-red-500 font-mono">-{p.tolMinus?.toFixed(3)}</td>
                                            <td className="px-4 py-2">{p.unit}</td>
                                        </>
                                    ) : (
                                        <td colSpan={4} className="px-4 py-2 italic text-gray-500">Boolean: Expected {p.expectedValue ? 'YES' : 'NO'}</td>
                                    )}
                                    <td className="px-4 py-2 flex gap-2">
                                        <button type="button" onClick={() => { setEditingParameter(p); setIsParameterModalOpen(true); }} className="text-gray-400 hover:text-blue-500"><EditIcon className="h-5 w-5" /></button>
                                        <button type="button" onClick={() => handleDeleteParameter(p.id)} className="text-gray-400 hover:text-red-500"><TrashIcon className="h-5 w-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {formData.parameters.length === 0 && <p className="text-gray-500 text-center py-4">No parameters have been defined.</p>}
                </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Plan</button>
          </div>
        </div>
      </div>
      {isParameterModalOpen && <ParameterModal parameter={editingParameter} onSave={handleSaveParameter} onClose={() => setIsParameterModalOpen(false)} />}
    </>
  );
};

// --- Main Component ---
interface ControlPlansProps {
    controlPlans: ControlPlan[];
    setControlPlans: React.Dispatch<React.SetStateAction<ControlPlan[]>>;
    parts: Part[];
}

export const ControlPlans: React.FC<ControlPlansProps> = ({ controlPlans, setControlPlans, parts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ControlPlan | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const handleAddNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };
  
  const handleEdit = (plan: ControlPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };
  
  const handleArchive = (planId: string) => {
     if (window.confirm('Are you sure you want to archive this plan?')) {
        setControlPlans(controlPlans.map(p => p.id === planId ? { ...p, status: 'Archived' } : p));
        alert('Plan has been successfully archived.');
     }
  };

  const handleRestore = (planId: string) => {
    setControlPlans(controlPlans.map(p => p.id === planId ? { ...p, status: 'Active' } : p));
    alert('Plan has been successfully restored.');
  };

  const handleCreateRevision = (planToRevise: ControlPlan) => {
     if (window.confirm(`Are you sure you want to create a new version for ${planToRevise.name}? The original version will be archived.`)) {
        const newRevisionPlan: ControlPlan = {
          ...planToRevise,
          id: `CP${Date.now()}`,
          version: planToRevise.version + 1,
          status: 'Active',
        };
        setControlPlans(prevPlans => [
          ...prevPlans.map(p => p.id === planToRevise.id ? { ...p, status: 'Archived' as const } : p),
          newRevisionPlan,
        ]);
        alert(`New version ${newRevisionPlan.version} has been created for plan ${planToRevise.name}.`);
    }
  };
  
  const handleSave = (plan: ControlPlan) => {
    if (editingPlan) {
      setControlPlans(controlPlans.map(p => p.id === plan.id ? plan : p));
    } else {
      setControlPlans([...controlPlans, plan]);
    }
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const visiblePlans = controlPlans.filter(p => showArchived ? p.status === 'Archived' : p.status === 'Active');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Control Plans</h2>
        <div className="flex items-center gap-4">
             <label className="flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium">Show Archived</span>
                <div className="relative">
                    <input type="checkbox" checked={showArchived} onChange={() => setShowArchived(!showArchived)} className="sr-only" />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${showArchived ? 'transform translate-x-6' : ''}`}></div>
                </div>
            </label>
            <button onClick={handleAddNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-5 w-5" /> Add Plan
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Plan Name</th>
                <th scope="col" className="px-6 py-3">Assigned Part</th>
                <th scope="col" className="px-6 py-3">Version</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePlans.map((plan) => {
                const part = parts.find(p => p.id === plan.partId);
                return (
                  <tr key={plan.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{plan.name}</td>
                    <td className="px-6 py-4">{part ? `${part.name} (Rev. ${part.revision})` : 'N/A'}</td>
                    <td className="px-6 py-4 font-mono">{plan.version}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${plan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{plan.status}</span></td>
                    <td className="px-6 py-4 flex items-center gap-4">
                      {plan.status === 'Active' ? (
                          <>
                              <button onClick={() => handleEdit(plan)} className="text-gray-500 hover:text-yellow-500" title="Edit Parameters"><EditIcon className="h-5 w-5" /></button>
                              <button onClick={() => handleCreateRevision(plan)} className="text-gray-500 hover:text-green-500" title="New Version"><RevisionIcon className="h-5 w-5" /></button>
                              <button onClick={() => handleArchive(plan.id)} className="text-gray-500 hover:text-red-500" title="Archive"><ArchiveIcon className="h-5 w-5" /></button>
                          </>
                      ) : (
                          <button onClick={() => handleRestore(plan.id)} className="text-gray-500 hover:text-green-500" title="Restore"><RestoreIcon className="h-5 w-5" /></button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
          <ControlPlanEditorModal 
            plan={editingPlan}
            parts={parts}
            onSave={handleSave}
            onClose={() => setIsModalOpen(false)}
          />
      )}
    </div>
  );
};
