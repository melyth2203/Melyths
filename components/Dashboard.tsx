
import React from 'react';
import type { Part, Gauge, ControlPlan, Sample } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PartsIcon, GaugeIcon, PlanIcon, SamplingIcon, WarningIcon } from './icons';
import { View } from '../App';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
        onClick={onClick}
        className={`p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer text-white flex items-center ${color}`}
    >
        <Icon className="h-12 w-12 mr-4 opacity-80" />
        <div>
            <p className="text-3xl font-bold">{value}</p>
            <h3 className="text-sm font-medium uppercase tracking-wider">{title}</h3>
        </div>
    </div>
);

interface DashboardProps {
    parts: Part[];
    gauges: Gauge[];
    controlPlans: ControlPlan[];
    samples: Sample[];
    setCurrentView: (view: View) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ parts, gauges, controlPlans, samples, setCurrentView }) => {
    const activeParts = parts.filter(p => p.status === 'Active');
    const activePlans = controlPlans.filter(p => p.status === 'Active');
    const gaugesDue = gauges.filter(g => g.status === 'Due for Calibration');
    const pendingSamples = samples.filter(s => s.status === 'Pending' || s.status === 'In Progress');

    const completedSamples = samples.filter(s => s.status === 'Completed');
    const chartData = activeParts.map(part => {
        const partSamples = completedSamples.filter(s => s.partId === part.id);
        const totalMeasurements = partSamples.reduce((acc, s) => acc + s.measurements.length, 0);
        const failedMeasurements = partSamples.reduce((acc, s) => acc + s.measurements.filter(m => !m.isOk).length, 0);
        return {
            name: part.name,
            Pass: totalMeasurements - failedMeasurements,
            Fail: failedMeasurements
        };
    }).filter(d => d.Pass > 0 || d.Fail > 0);

    const recentActivity = samples
      .filter(s => s.status === 'Completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
      
    const samplesWithFailures = completedSamples
      .map(sample => ({
          sample,
          failCount: sample.measurements.filter(m => !m.isOk).length
      }))
      .filter(item => item.failCount > 0)
      .sort((a, b) => b.failCount - a.failCount)
      .slice(0, 3);


    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="xl:col-span-2 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard title="Active Parts" value={activeParts.length} icon={PartsIcon} color="bg-gradient-to-br from-blue-500 to-blue-600" onClick={() => setCurrentView('PARTS')} />
                    <StatCard title="Gauges Due for Calibration" value={gaugesDue.length} icon={GaugeIcon} color="bg-gradient-to-br from-orange-500 to-orange-600" onClick={() => setCurrentView('GAUGES')} />
                    <StatCard title="Active Plans" value={activePlans.length} icon={PlanIcon} color="bg-gradient-to-br from-purple-500 to-purple-600" onClick={() => setCurrentView('PLANS')} />
                    <StatCard title="Samples to Measure" value={pendingSamples.length} icon={SamplingIcon} color="bg-gradient-to-br from-green-500 to-green-600" onClick={() => setCurrentView('SAMPLING')} />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Part Quality Overview</h3>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: 'rgba(128, 128, 0.5)' }} />
                                <Legend />
                                <Bar dataKey="Pass" stackId="a" fill="#22c55e" name="Pass" />
                                <Bar dataKey="Fail" stackId="a" fill="#ef4444" name="Fail" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[250px] flex items-center justify-center text-gray-500">No completed measurements to display.</div>
                    )}
                </div>
            </div>

            {/* Side content */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                        <WarningIcon className="h-6 w-6 mr-2 text-yellow-500" />
                        Needs Attention
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-sm uppercase text-gray-500 dark:text-gray-400">Gauge Calibration</h4>
                            {gaugesDue.length > 0 ? (
                                <ul className="list-disc list-inside mt-2 text-sm">
                                    {gaugesDue.map(g => <li key={g.id}>{g.name} (due {g.nextCalibration})</li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-500 mt-2">All gauges are calibrated.</p>}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm uppercase text-gray-500 dark:text-gray-400">Samples with Non-conformance</h4>
                            {samplesWithFailures.length > 0 ? (
                               <ul className="list-disc list-inside mt-2 text-sm">
                                    {samplesWithFailures.map(item => <li key={item.sample.id}>{item.sample.id} ({item.failCount} NOK)</li>)}
                                </ul>
                            ) : <p className="text-sm text-gray-500 mt-2">No samples with non-conformance.</p>}
                        </div>
                    </div>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Activity</h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? recentActivity.map(sample => {
                           const part = parts.find(p => p.id === sample.partId);
                           return (
                                <div key={sample.id} className="text-sm">
                                    <p className="font-semibold">{part?.name || 'Unknown Part'}</p>
                                    <p className="text-gray-500 dark:text-gray-400">Sample <span className="font-mono">{sample.id}</span> measured.</p>
                                </div>
                           )
                        }) : <p className="text-sm text-gray-500">No recent activity.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};
