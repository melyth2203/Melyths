import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PartsCatalog } from './components/PartsCatalog';
import { GaugeManagement } from './components/GaugeManagement';
import { ControlPlans } from './components/ControlPlans';
import { Sampling } from './components/Sampling';
import { IncomingInspection } from './components/IncomingInspection';
import { Receiving } from './components/Receiving';
import { MetrologyProIcon } from './components/icons';
import { mockParts, mockGauges, mockControlPlans, mockSamples, mockInspectionSamples } from './lib/mockData';
import type { Part, Gauge, ControlPlan, Sample } from './types';

export type View = 'DASHBOARD' | 'PARTS' | 'GAUGES' | 'PLANS' | 'SAMPLING' | 'INSPECTION' | 'RECEIVING';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [parts, setParts] = useState<Part[]>(mockParts);
  const [gauges, setGauges] = useState<Gauge[]>(mockGauges);
  const [controlPlans, setControlPlans] = useState<ControlPlan[]>(mockControlPlans);
  const [samples, setSamples] = useState<Sample[]>(mockSamples);
  const [inspectionSamples, setInspectionSamples] = useState<Sample[]>(mockInspectionSamples);


  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard parts={parts} gauges={gauges} controlPlans={controlPlans} samples={samples} setCurrentView={setCurrentView} />;
      case 'PARTS':
        return <PartsCatalog parts={parts} setParts={setParts} />;
      case 'GAUGES':
        return <GaugeManagement gauges={gauges} setGauges={setGauges} />;
      case 'PLANS':
        return <ControlPlans controlPlans={controlPlans} setControlPlans={setControlPlans} parts={parts} />;
      case 'SAMPLING':
        return <Sampling samples={samples} setSamples={setSamples} allParts={parts} allControlPlans={controlPlans} />;
      case 'RECEIVING':
        return <Receiving parts={parts} controlPlans={controlPlans} setInspectionSamples={setInspectionSamples} />;
      case 'INSPECTION':
        return <IncomingInspection 
            inspectionSamples={inspectionSamples} 
            setInspectionSamples={setInspectionSamples} 
            allParts={parts} 
            allControlPlans={controlPlans} 
        />;
      default:
        return <Dashboard parts={parts} gauges={gauges} controlPlans={controlPlans} samples={samples} setCurrentView={setCurrentView}/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <MetrologyProIcon className="h-8 w-8 text-blue-500" />
            <h1 className="text-2xl font-semibold">Metrology Pro X</h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm">Welcome, User</span>
             <img className="h-8 w-8 rounded-full object-cover" src="https://picsum.photos/100/100" alt="User avatar" />
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;