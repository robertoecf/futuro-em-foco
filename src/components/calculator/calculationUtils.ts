
import type { InvestorProfile } from './types';

// Get accumulation annual return based on investor profile
export const getAccumulationAnnualReturn = (investorProfile: InvestorProfile) => {
  console.log('Getting accumulation return for profile:', investorProfile);
  switch (investorProfile) {
    case 'conservador': return 0.04; // 4% a.a.
    case 'moderado': return 0.055; // 5.5% a.a.
    case 'arrojado': return 0.065; // 6.5% a.a.
    default: return 0.055;
  }
};
