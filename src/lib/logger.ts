export const logger = {
  log: (...args: unknown[]): void => {
    if (import.meta.env.MODE !== 'production') {
      console.log(...args);
    }
  },
  error: (...args: unknown[]): void => {
    if (import.meta.env.MODE !== 'production') {
      console.error(...args);
    }
  },
};

export default logger;
