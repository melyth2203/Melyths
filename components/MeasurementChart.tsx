
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { Measurement, MeasurementParameter } from '../types';

interface MeasurementChartProps {
  measurements: Measurement[];
  parameter: MeasurementParameter;
}

export const MeasurementChart: React.FC<MeasurementChartProps> = ({ measurements, parameter }) => {
  if (!parameter) return null;

  const data = measurements.map((m, index) => ({
      name: `M${index + 1}`,
      value: m.value,
  }));
  
  const upperLimit = parameter.nominal + parameter.tolPlus;
  const lowerLimit = parameter.nominal - parameter.tolMinus;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
          <XAxis dataKey="name" />
          <YAxis domain={[lowerLimit * 0.99, upperLimit * 1.01]} />
          <Tooltip 
            contentStyle={{
                backgroundColor: 'rgba(31, 41, 55, 0.8)',
                borderColor: 'rgba(128, 128, 0.5)'
            }}
          />
          <Legend />

          <ReferenceArea y1={lowerLimit} y2={upperLimit} fill="#22c55e" fillOpacity={0.2} label={{ value: 'Tolerance', position: 'insideTopLeft' }} />
          
          <ReferenceLine y={parameter.nominal} label="Nominal" stroke="#fb923c" strokeDasharray="3 3" />
          <ReferenceLine y={upperLimit} label="Tol+" stroke="#f87171" strokeDasharray="3 3" />
          <ReferenceLine y={lowerLimit} label="Tol-" stroke="#f87171" strokeDasharray="3 3" />

          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name="Measured Value" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
