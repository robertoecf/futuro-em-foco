import { validateAndSanitize, sanitizeCSVValue } from '@/lib/validation';

interface UserData {
  name: string;
  email: string;
  phone: string;
  wantsExpertEvaluation: boolean;
}

export interface ChartDataPoint {
  age: number;
  patrimonio: number;
  poupanca: number;
  fase: string;
  pessimistic?: number;
  median?: number;
  optimistic?: number;
  percentile25?: number;
  percentile75?: number;
  [key: string]: number | string | undefined; // Para as linhas Monte Carlo dinâmicas (line0, line1, etc.)
}

export const generateSecureExcelFile = (chartData: ChartDataPoint[], userData: UserData) => {
  // Create CSV content with proper sanitization
  const headers = ['Idade', 'Patrimonio', 'Total_Poupado', 'Fase'];

  // Add Monte Carlo headers if available
  if (chartData[0]?.pessimistic !== undefined) {
    headers.push('Cenario_Pessimista', 'Cenario_Neutro', 'Cenario_Otimista');
  }

  const csvContent = [
    headers.map((h) => sanitizeCSVValue(h)).join(','),
    ...chartData.map((row) => {
      const basicData = [
        sanitizeCSVValue(row.age?.toString() || ''),
        sanitizeCSVValue(row.patrimonio?.toFixed(2) || ''),
        sanitizeCSVValue(row.poupanca?.toFixed(2) || ''),
        sanitizeCSVValue(row.fase || ''),
      ];

      if (row.pessimistic !== undefined) {
        basicData.push(
          sanitizeCSVValue(row.pessimistic?.toFixed(2) || ''),
          sanitizeCSVValue(row.median?.toFixed(2) || ''),
          sanitizeCSVValue(row.optimistic?.toFixed(2) || '')
        );
      }

      return basicData.join(',');
    }),
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);

  const sanitizedName = validateAndSanitize.sanitizeString(userData.name);
  const fileName = `planejamento_aposentadoria_${sanitizedName.replace(/\s+/g, '_')}.csv`;
  link.setAttribute('download', fileName);

  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
