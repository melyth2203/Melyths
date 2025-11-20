
import React from 'react';
import type { Bubble } from '../types';

interface InteractiveDrawingProps {
  imageUrl: string;
  bubbles: Bubble[];
  setBubbles: React.Dispatch<React.SetStateAction<Bubble[]>>;
  selectedParameterId: string | null;
  onBubbleSelect: (parameterId: string) => void;
}

export const InteractiveDrawing: React.FC<InteractiveDrawingProps> = ({ 
    imageUrl, 
    bubbles, 
    setBubbles,
    selectedParameterId,
    onBubbleSelect
}) => {
  const drawingRef = React.useRef<HTMLDivElement>(null);

  const handleDrawingClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!drawingRef.current || !selectedParameterId) {
        alert("First, select a parameter from the list to add a bubble.");
        return;
    }
    const rect = drawingRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    
    // Check if a bubble for this parameter already exists
    if (bubbles.some(b => b.parameterId === selectedParameterId)) {
        // Update existing bubble position
        setBubbles(prev => prev.map(b => b.parameterId === selectedParameterId ? {...b, x, y} : b));
    } else {
        // Add new bubble
        const newBubble: Bubble = {
            id: bubbles.length + 1,
            x,
            y,
            parameterId: selectedParameterId,
        };
        setBubbles([...bubbles, newBubble]);
    }
  };

  return (
    <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow-inner" ref={drawingRef} onClick={handleDrawingClick}>
      <img src={imageUrl} alt="Technical Drawing" className="w-full h-full object-contain" />
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
            bubble.parameterId === selectedParameterId ? 'w-8 h-8 bg-blue-500 ring-4 ring-blue-300' : 'w-6 h-6 bg-orange-500 hover:bg-orange-400'
          }`}
          style={{ left: `${bubble.x}%`, top: `${bubble.y}%` }}
          onClick={(e) => {
            e.stopPropagation();
            onBubbleSelect(bubble.parameterId);
          }}
        >
          <span className="text-white text-xs font-bold">{bubble.id}</span>
        </div>
      ))}
    </div>
  );
};
