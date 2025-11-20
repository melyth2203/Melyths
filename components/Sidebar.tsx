
import React from 'react';
import type { View } from '../App';
import { DashboardIcon, PartsIcon, GaugeIcon, PlanIcon, SamplingIcon, InspectionIcon, MetrologyProIcon, ReceivingIcon } from './icons';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  icon: React.ElementType;
  label: string;
  view: View;
  currentView: View;
  onClick: (view: View) => void;
}> = ({ icon: Icon, label, view, currentView, onClick }) => {
  const isActive = currentView === view;
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick(view);
      }}
      className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-blue-600 text-white' : ''
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="ml-4 font-medium">{label}</span>
    </a>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="flex flex-col w-64 bg-gray-800 text-white">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
           <MetrologyProIcon className="h-10 w-10 text-blue-500" />
           <span className="ml-2 text-xl font-bold">Metrology Pro</span>
        </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        <NavItem icon={DashboardIcon} label="Dashboard" view="DASHBOARD" currentView={currentView} onClick={setCurrentView} />
        <NavItem icon={PartsIcon} label="Parts Catalog" view="PARTS" currentView={currentView} onClick={setCurrentView} />
        <NavItem icon={GaugeIcon} label="Gauge Management" view="GAUGES" currentView={currentView} onClick={setCurrentView} />
        <NavItem icon={PlanIcon} label="Control Plans" view="PLANS" currentView={currentView} onClick={setCurrentView} />
        <NavItem icon={ReceivingIcon} label="Receiving" view="RECEIVING" currentView={currentView} onClick={setCurrentView} />
        <NavItem icon={InspectionIcon} label="Incoming Inspection" view="INSPECTION" currentView={currentView} onClick={setCurrentView} />
        <NavItem icon={SamplingIcon} label="Sampling / Measurement" view="SAMPLING" currentView={currentView} onClick={setCurrentView} />
      </nav>
    </div>
  );
};
