
import { encryption } from './encryption';

interface StoredData {
  data: any;
  timestamp: number;
  expiresIn?: number; // milliseconds
}

class SecureStorage {
  private readonly DEFAULT_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

  set(key: string, value: any, expiresIn?: number): void {
    try {
      const storedData: StoredData = {
        data: value,
        timestamp: Date.now(),
        expiresIn: expiresIn || this.DEFAULT_EXPIRY
      };
      
      const encrypted = encryption.encrypt(storedData);
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('Error storing secure data:', error);
    }
  }

  get(key: string, defaultValue: any = null): any {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return defaultValue;

      const storedData: StoredData = encryption.decrypt(encrypted);
      if (!storedData) return defaultValue;

      // Check expiration
      if (storedData.expiresIn && 
          Date.now() - storedData.timestamp > storedData.expiresIn) {
        this.remove(key);
        return defaultValue;
      }

      return storedData.data;
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return defaultValue;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(`secure_${key}`);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Clean up expired items
  cleanup(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        const value = this.get(key.replace('secure_', ''));
        // get() automatically removes expired items
      }
    });
  }
}

export const secureStorage = new SecureStorage();
