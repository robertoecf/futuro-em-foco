
// Function to load data from localStorage
export const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Function to save to localStorage
export const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Function to load data from a shared plan
export const loadFromSharedPlan = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  
  if (planId) {
    try {
      const planData = localStorage.getItem(`planning_${planId}`);
      if (planData) {
        const parsed = JSON.parse(planData);
        return parsed.planningInputs;
      }
    } catch (error) {
      console.error('Error loading shared plan:', error);
    }
  }
  return null;
};
