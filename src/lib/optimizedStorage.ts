import { encryption } from './encryption';
import { logger } from './logger';

interface StoredData {
  data: unknown;
  timestamp: number;
  expiresIn?: number;
}

interface BatchUpdate {
  key: string;
  value: unknown;
  expiresIn?: number;
}

class OptimizedStorage {
  private readonly DEFAULT_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
  private cache = new Map<string, unknown>();
  private batchQueue: BatchUpdate[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly BATCH_DELAY = 100; // 100ms batch delay

  // Get from cache first, then storage
  get<T>(key: string, defaultValue: T | null = null): T | null {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) as T | null;
    }

    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return defaultValue;

      const storedData = encryption.decrypt<StoredData>(encrypted);
      if (!storedData) return defaultValue;

      // Check expiration
      if (storedData.expiresIn && Date.now() - storedData.timestamp > storedData.expiresIn) {
        this.remove(key);
        return defaultValue;
      }

      // Cache the result
      this.cache.set(key, storedData.data);
      return storedData.data as T;
    } catch (error) {
      logger.error('Error retrieving data:', error);
      return defaultValue;
    }
  }

  // Batch set operations
  set<T>(key: string, value: T, expiresIn?: number): void {
    // Update cache immediately
    this.cache.set(key, value);

    // Add to batch queue
    this.batchQueue.push({ key, value, expiresIn });

    // Schedule batch processing
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(() => {
      this.processBatch();
    }, this.BATCH_DELAY);
  }

  private processBatch(): void {
    if (this.batchQueue.length === 0) return;

    try {
      // Process all queued updates
      this.batchQueue.forEach(({ key, value, expiresIn }) => {
        const storedData: StoredData = {
          data: value,
          timestamp: Date.now(),
          expiresIn: expiresIn || this.DEFAULT_EXPIRY,
        };

        const encrypted = encryption.encrypt(storedData);
        localStorage.setItem(`secure_${key}`, encrypted);
      });

      logger.log(`📦 Processed batch of ${this.batchQueue.length} storage updates`);
      this.batchQueue = [];
    } catch (error) {
      logger.error('Error processing batch updates:', error);
    }
  }

  remove(key: string): void {
    this.cache.delete(key);
    localStorage.removeItem(`secure_${key}`);
  }

  clear(): void {
    this.cache.clear();
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Async cleanup to prevent blocking
  async cleanup(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith('secure_')) {
            this.get(key.replace('secure_', ''));
            // get() automatically removes expired items
          }
        });
        resolve();
      }, 0);
    });
  }
}

export const optimizedStorage = new OptimizedStorage();
