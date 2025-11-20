
import React, { useState } from 'react';
import type { Part } from '../types';
import { PlusIcon, EditIcon, ArchiveIcon, RestoreIcon, EyeIcon, RevisionIcon, CloseIcon } from './icons';

// --- Part Detail Modal ---
const PartDetailModal: React.FC<{ part: Part | null; onClose: () => void }> = ({ part, onClose }) => {
  if (!part) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{part.name} (Rev. {part.revision})</h2>
            <button onClick={onClose}><CloseIcon className="h-6 w-6" /></button>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
            <img src={part.imageUrl} alt={part.name} className="w-full md:w-1/2 h-auto object-cover rounded-lg" />
            <div className="space-y-2">
                <p><strong>Part Code:</strong> <span className="font-mono">{part.partCode}</span></p>
                <p><strong>Drawing Number:</strong> {part.drawingNumber}</p>
                <p><strong>Material:</strong> {part.material}</p>
                <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full ${part.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{part.status}</span></p>
                <p><strong>ID:</strong> <span className="font-mono">{part.id}</span></p>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Part Edit/Add Modal ---
const PartModal: React.FC<{
  part: Part | null;
  onClose: () => void;
  onSave: (part: Part) => void;
}> = ({ part, onClose, onSave }) => {
  const [formData, setFormData] = useState<Omit<Part, 'id' | 'revision' | 'status'>>(
    part || { name: '', partCode: '', drawingNumber: '', material: '', imageUrl: `https://picsum.photos/seed/${Date.now()}/400/300` }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (part) { // Editing existing part
        onSave({ ...part, ...formData });
    } else { // Creating new part
        onSave({ ...formData, id: `P${Date.now()}`, revision: 1, status: 'Active' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">{part ? `Edit Part (Rev. ${part.revision})` : 'Add New Part'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Part Name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="partCode" placeholder="Part Code (e.g., PN-1234)" value={formData.partCode} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="drawingNumber" placeholder="Drawing Number" value={formData.drawingNumber} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="material" placeholder="Material" value={formData.material} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} required className="w-full p-2 rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- Main Component ---
interface PartsCatalogProps {
  parts: Part[];
  setParts: React.Dispatch<React.SetStateAction<Part[]>>;
}

export const PartsCatalog: React.FC<PartsCatalogProps> = ({ parts, setParts }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  const handleAddNew = () => {
    setSelectedPart(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (part: Part) => {
    setSelectedPart(part);
    setIsDetailModalOpen(true);
  };

  const handleArchive = (partId: string) => {
    if (window.confirm('Are you sure you want to archive this part?')) {
      setParts(parts.map(p => p.id === partId ? { ...p, status: 'Archived' } : p));
      alert('Part has been successfully archived.');
    }
  };

  const handleRestore = (partId: string) => {
    setParts(parts.map(p => p.id === partId ? { ...p, status: 'Active' } : p));
    alert('Part has been successfully restored.');
  };
  
  const handleCreateRevision = (partToRevise: Part) => {
    if (window.confirm(`Are you sure you want to create a new revision for ${partToRevise.name}? The original revision will be archived.`)) {
        const newRevisionPart: Part = {
          ...partToRevise,
          id: `P${Date.now()}`,
          revision: partToRevise.revision + 1,
          status: 'Active',
        };
        
        setParts(prevParts => [
          ...prevParts.map(p => p.id === partToRevise.id ? { ...p, status: 'Archived' as const } : p),
          newRevisionPart,
        ]);
        alert(`New revision ${newRevisionPart.revision} has been created for part ${partToRevise.name}.`);
    }
  };

  const handleSave = (part: Part) => {
    if (selectedPart) { // Editing
      setParts(parts.map(p => p.id === part.id ? part : p));
    } else { // Adding new
      setParts([...parts, part]);
    }
    setIsEditModalOpen(false);
    setSelectedPart(null);
  };

  const visibleParts = parts.filter(p => showArchived ? p.status === 'Archived' : p.status === 'Active');

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Parts Catalog</h2>
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
                <PlusIcon className="h-5 w-5" /> Add Part
            </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Part Name</th>
                <th scope="col" className="px-6 py-3">Part Code</th>
                <th scope="col" className="px-6 py-3">Revision</th>
                <th scope="col" className="px-6 py-3">Drawing Number</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleParts.map((part) => (
                <tr key={part.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleViewDetails(part); }} className="hover:underline text-blue-500">{part.name}</a>
                  </td>
                  <td className="px-6 py-4 font-mono">{part.partCode}</td>
                  <td className="px-6 py-4 font-mono">{part.revision}</td>
                  <td className="px-6 py-4">{part.drawingNumber}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${part.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{part.status}</span></td>
                  <td className="px-6 py-4 flex items-center gap-4">
                    {part.status === 'Active' ? (
                        <>
                            <button onClick={() => handleViewDetails(part)} className="text-gray-500 hover:text-blue-500" title="Details"><EyeIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleEdit(part)} className="text-gray-500 hover:text-yellow-500" title="Edit"><EditIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleCreateRevision(part)} className="text-gray-500 hover:text-green-500" title="New Revision"><RevisionIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleArchive(part.id)} className="text-gray-500 hover:text-red-500" title="Archive"><ArchiveIcon className="h-5 w-5" /></button>
                        </>
                    ) : (
                        <button onClick={() => handleRestore(part.id)} className="text-gray-500 hover:text-green-500" title="Restore"><RestoreIcon className="h-5 w-5" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isEditModalOpen && <PartModal part={selectedPart} onClose={() => setIsEditModalOpen(false)} onSave={handleSave} />}
      {isDetailModalOpen && <PartDetailModal part={selectedPart} onClose={() => setIsDetailModalOpen(false)} />}
    </div>
  );
};
