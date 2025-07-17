/**
 * LocalStorage Calculation Repository Implementation
 *
 * Implements CalculationRepository using browser localStorage.
 * Provides persistent storage for calculation results across sessions.
 */

import type {
  CalculationRepository,
  CalculationData,
} from '@/domain/repositories/CalculationRepository';

export class LocalStorageCalculationRepository implements CalculationRepository {
  private readonly storageKey = 'futuro-em-foco-calculations';
  private readonly maxStorageSize = 50; // Maximum number of calculations to store

  /**
   * Saves a calculation result to localStorage
   */
  async save(calculation: CalculationData): Promise<void> {
    try {
      const calculations = await this.getAllCalculations();

      // Remove existing calculation with same ID if exists
      const filtered = calculations.filter((c) => c.id !== calculation.id);

      // Add new calculation
      filtered.unshift(calculation);

      // Limit storage size
      if (filtered.length > this.maxStorageSize) {
        filtered.splice(this.maxStorageSize);
      }

      this.saveToStorage(filtered);
    } catch {
      // Error saving calculation
    }
  }

  /**
   * Retrieves a calculation by ID
   */
  async findById(id: string): Promise<CalculationData | null> {
    try {
      const calculations = await this.getAllCalculations();
      return calculations.find((c) => c.id === id) || null;
    } catch {
      // Error finding calculation by ID
      return null;
    }
  }

  /**
   * Retrieves all calculations for a user
   */
  async findByUserId(userId: string): Promise<CalculationData[]> {
    try {
      const calculations = await this.getAllCalculations();
      return calculations.filter((c) => c.userId === userId);
    } catch {
      // Error finding calculations by user ID
      return [];
    }
  }

  /**
   * Retrieves recent calculations
   */
  async findRecent(limit: number): Promise<CalculationData[]> {
    try {
      const calculations = await this.getAllCalculations();
      return calculations
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch {
      // Error finding recent calculations
      return [];
    }
  }

  /**
   * Updates an existing calculation
   */
  async update(id: string, calculation: Partial<CalculationData>): Promise<void> {
    try {
      const calculations = await this.getAllCalculations();
      const index = calculations.findIndex((c) => c.id === id);

      if (index === -1) {
        // Calculation not found
      }

      calculations[index] = { ...calculations[index], ...calculation };
      this.saveToStorage(calculations);
    } catch {
      // Error updating calculation
    }
  }

  /**
   * Deletes a calculation
   */
  async delete(id: string): Promise<void> {
    try {
      const calculations = await this.getAllCalculations();
      const filtered = calculations.filter((c) => c.id !== id);
      this.saveToStorage(filtered);
    } catch {
      // Error deleting calculation
    }
  }

  /**
   * Deletes all calculations for a user
   */
  async deleteByUserId(userId: string): Promise<void> {
    try {
      const calculations = await this.getAllCalculations();
      const filtered = calculations.filter((c) => c.userId !== userId);
      this.saveToStorage(filtered);
    } catch {
      // Error deleting calculations by user ID
    }
  }

  /**
   * Clears all calculations
   */
  async clear(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      // Error clearing calculations
    }
  }

  /**
   * Retrieves all calculations from localStorage
   */
  private async getAllCalculations(): Promise<CalculationData[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];

      const parsed = JSON.parse(data as unknown as string);

      // Convert string dates back to Date objects
      return parsed.map((calc: unknown) => ({
        ...(calc as CalculationData),
        timestamp: new Date((calc as CalculationData).timestamp),
      }));
    } catch {
      // Error parsing calculations from localStorage
      return [];
    }
  }

  /**
   * Saves calculations to localStorage
   */
  private saveToStorage(calculations: CalculationData[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(calculations));
    } catch {
      // Error saving to localStorage
    }
  }

  /**
   * Gets storage usage statistics
   */
  getStorageStats(): {
    totalCalculations: number;
    storageSize: number;
    maxStorageSize: number;
  } {
    try {
      const data = localStorage.getItem(this.storageKey);
      const calculations = data ? JSON.parse(data as unknown as string) : [];

      return {
        totalCalculations: calculations.length,
        storageSize: data ? (data as unknown as string).length : 0,
        maxStorageSize: this.maxStorageSize,
      };
    } catch {
      // Error getting storage stats
      return {
        totalCalculations: 0,
        storageSize: 0,
        maxStorageSize: this.maxStorageSize,
      };
    }
  }
}
