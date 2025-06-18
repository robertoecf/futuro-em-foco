
import { ReferenceLine } from 'recharts';

interface ReferenceLinesProps {
  possibleRetirementAge: number;
  perpetuityWealth: number;
}

export const ReferenceLines = ({ possibleRetirementAge, perpetuityWealth }: ReferenceLinesProps) => {
  return (
    <>
      {/* Reference line for possible retirement age */}
      <ReferenceLine 
        x={possibleRetirementAge} 
        stroke="#9CA3AF" 
        strokeDasharray="5 5" 
        label={{ 
          value: 'Idade de Aposentadoria', 
          position: 'top', 
          fill: '#6B7280',
          fontSize: 11
        }} 
      />
      
      {/* Reference line for perpetuity wealth */}
      {perpetuityWealth > 0 && (
        <ReferenceLine 
          y={perpetuityWealth} 
          stroke="#9CA3AF" 
          strokeDasharray="8 4" 
          label={{ 
            value: 'Patrimônio Perpetuidade', 
            position: 'insideTopRight', 
            fill: '#6B7280',
            fontSize: 11
          }} 
        />
      )}
    </>
  );
};
