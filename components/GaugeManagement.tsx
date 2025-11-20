
import React, { useState } from 'react';
import type { Gauge } from '../types';
import { PlusIcon, EditIcon, TrashIcon, CloseIcon } from './icons';

interface GaugeManagementProps {
  gauges: Gauge[];
  setGauges: React.Dispatch<React.SetStateAction<Gauge[]>>;
}

const getStatusClass = (status: 'Active' | 'Inactive' | 'Due for Calibration') => {
    switch (status) {
        case 'Active':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'Inactive':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'Due for Calibration':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
}

export const GaugeManagement: React.FC<GaugeManagementProps> = ({ gauges, setGauges }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGauge, setEditingGauge] = useState<Gauge | null>(null);

  const handleAddNew = () => {
    setEditingGauge(null);
    setIsModalOpen(true);
  };

  const handleEdit = (gauge: Gauge) => {
    setEditingGauge(gauge);
    setIsModalOpen(true);
  };

  const handleDelete = (gaugeId: string) => {
    if (window.confirm('Are you sure you want to delete this gauge?')) {
      setGauges(gauges.filter(g => g.id !== gaugeId));
    }
  };

  const handleSave = (gauge: Gauge) => {
    if (editingGauge) {
      setGauges(gauges.map(g => g.id === gauge.id ? gauge : g));
    } else {
      const newGauge = { ...gauge, id: `G${Date.now()}` };
      setGauges([...gauges, newGauge]);
    }
    setIsModalOpen(false);
    setEditingGauge(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Gauge Management</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Add Gauge
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Gauge Name</th>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Serial Number</th>
                <th scope="col" className="px-6 py-3">Last Calibration</th>
                <th scope="col" className="px-6 py-3">Next Calibration</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gauges.map((gauge) => (
                <tr key={gauge.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{gauge.name}</td>
                  <td className="px-6 py-4">{gauge.type}</td>
                  <td className="px-6 py-4">{gauge.serialNumber}</td>
                  <td className="px-6 py-4">{gauge.lastCalibration}</td>
                  <td className="px-6 py-4">{gauge.nextCalibration}</td>
                  <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(gauge.status)}`}>
                          {gauge.status}
                      </span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    <button onClick={() => handleEdit(gauge)} className="text-blue-500 hover:text-blue-700">
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(gauge.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <GaugeModal
          gauge={editingGauge}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};


const GaugeModal: React.FC<{
  gauge: Gauge | null;
  onClose: () => void;
  onSave: (gauge: Gauge) => void;
}> = ({ gauge, onClose, onSave }) => {
  const [formData, setFormData] = useState<Gauge>(
    gauge || { id: '', name: '', type: '', serialNumber: '', lastCalibration: '', nextCalibration: '', status: 'Active' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{gauge ? 'Edit Gauge' : 'Add New Gauge'}</h2>
          <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Gauge Name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="type" placeholder="Type" value={formData.type} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="serialNumber" placeholder="Serial Number" value={formData.serialNumber} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <div>
            <label className="text-sm">Last Calibration</label>
            <input type="date" name="lastCalibration" value={formData.lastCalibration} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <div>
            <label className="text-sm">Next Calibration</label>
            <input type="date" name="nextCalibration" value={formData.nextCalibration} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          </div>
          <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Due for Calibration">Due for Calibration</option>
          </select>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
