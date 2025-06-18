
import { Line } from 'recharts';
import { useFinalLinesDrawing } from './useFinalLinesDrawing';

interface FinalLinesRendererProps {
  isDrawingFinalLines: boolean;
}

export const FinalLinesRenderer = ({ isDrawingFinalLines }: FinalLinesRendererProps) => {
  const { getLineStyle } = useFinalLinesDrawing({ isDrawingFinalLines });

  return (
    <>
      {/* Pessimistic Line */}
      <Line 
        key="pessimistic-final"
        type="monotone" 
        dataKey="pessimistic" 
        name="Cenário Pessimista"
        stroke="#DC2626" 
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 6, stroke: '#DC2626', strokeWidth: 2, fill: '#fff' }}
        isAnimationActive={false}
        style={getLineStyle('pessimistic')}
      />
      
      {/* Median Line */}
      <Line 
        key="median-final"
        type="monotone" 
        dataKey="median" 
        name="Cenário Neutro"
        stroke="#3B82F6" 
        strokeWidth={3}
        dot={false}
        activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff' }}
        isAnimationActive={false}
        style={getLineStyle('median')}
      />
      
      {/* Optimistic Line */}
      <Line 
        key="optimistic-final"
        type="monotone" 
        dataKey="optimistic" 
        name="Cenário Otimista"
        stroke="#10B981" 
        strokeWidth={2}
        dot={false}
        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#fff' }}
        isAnimationActive={false}
        style={getLineStyle('optimistic')}
      />
    </>
  );
};
