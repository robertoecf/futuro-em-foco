/**
 * Planning Data Repository
 * 
 * Repository interface and implementation for persisting planning data.
 * Abstracts data persistence logic from domain services, enabling
 * easy swapping of storage mechanisms (localStorage, database, etc.).
 */

import type { InvestorProfile } from '@/types/core/calculator';
import { Money } from '@/domain/value-objects/Money';

// Domain Entities
export interface PlanningSession {
  id: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  data: PlanningData;
}

export interface PlanningData {
  personalInfo: {
    currentAge: number;
    targetRetirementAge: number;
    lifeExpectancy: number;
    investorProfile: InvestorProfile;
  };
  financialInfo: {
    initialAmount: Money;
    monthlyContribution: Money;
    targetRetirementIncome?: Money;
    currentSavings?: Money;
  };
  preferences: {
    riskTolerance: 'low' | 'medium' | 'high';
    prioritizeGrowth: boolean;
    considerInflation: boolean;
    inflationRate: number;
  };
  calculationResults?: {
    lastCalculatedAt: Date;
    projectedWealth: Money;
    sustainableIncome: Money;
    successProbability: number;
  };
}

export interface UserPreferences {
  currency: string;
  locale: string;
  defaultProfile: InvestorProfile;
  autoSave: boolean;
  simulationDetail: 'basic' | 'detailed' | 'comprehensive';
}

// Repository Interfaces
export interface IPlanningDataRepository {
  // Session Management
  createSession(data: Partial<PlanningSession>): Promise<PlanningSession>;
  getSession(id: string): Promise<PlanningSession | null>;
  updateSession(id: string, data: Partial<PlanningSession>): Promise<PlanningSession>;
  deleteSession(id: string): Promise<boolean>;
  
  // User Sessions
  getUserSessions(userId?: string): Promise<PlanningSession[]>;
  getRecentSessions(limit?: number): Promise<PlanningSession[]>;
  
  // Current Session Management
  saveCurrentSession(data: PlanningData): Promise<void>;
  getCurrentSession(): Promise<PlanningData | null>;
  clearCurrentSession(): Promise<void>;
  
  // User Preferences
  saveUserPreferences(preferences: UserPreferences): Promise<void>;
  getUserPreferences(): Promise<UserPreferences | null>;
  
  // Data Validation and Migration
  validateSessionData(data: unknown): data is PlanningData;
  migrateSessionData(data: unknown): PlanningData;
}

/**
 * Local Storage Implementation
 */
export class LocalStoragePlanningDataRepository implements IPlanningDataRepository {
  private readonly storagePrefix = 'futuro_em_foco_';
  private readonly currentSessionKey = 'current_session';
  private readonly sessionsKey = 'planning_sessions';
  private readonly preferencesKey = 'user_preferences';
  
  // Session Management
  async createSession(data: Partial<PlanningSession>): Promise<PlanningSession> {
    const session: PlanningSession = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: data.name || `Planejamento ${new Date().toLocaleDateString()}`,
      description: data.description,
      userId: data.userId,
      data: data.data || this.getDefaultPlanningData(),
      ...data
    };
    
    const sessions = await this.getUserSessions(session.userId);
    sessions.push(session);
    
    await this.saveToStorage(this.sessionsKey, sessions);
    return session;
  }
  
  async getSession(id: string): Promise<PlanningSession | null> {
    const sessions = await this.getUserSessions();
    return sessions.find(session => session.id === id) || null;
  }
  
  async updateSession(id: string, data: Partial<PlanningSession>): Promise<PlanningSession> {
    const sessions = await this.getUserSessions();
    const sessionIndex = sessions.findIndex(session => session.id === id);
    
    if (sessionIndex === -1) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    const updatedSession = {
      ...sessions[sessionIndex],
      ...data,
      updatedAt: new Date()
    };
    
    sessions[sessionIndex] = updatedSession;
    await this.saveToStorage(this.sessionsKey, sessions);
    
    return updatedSession;
  }
  
  async deleteSession(id: string): Promise<boolean> {
    const sessions = await this.getUserSessions();
    const initialLength = sessions.length;
    const filteredSessions = sessions.filter(session => session.id !== id);
    
    if (filteredSessions.length === initialLength) {
      return false; // Session not found
    }
    
    await this.saveToStorage(this.sessionsKey, filteredSessions);
    return true;
  }
  
  // User Sessions
  async getUserSessions(userId?: string): Promise<PlanningSession[]> {
    const sessions = await this.loadFromStorage<PlanningSession[]>(this.sessionsKey, []);
    
    if (!userId) {
      return sessions;
    }
    
    return sessions.filter(session => session.userId === userId);
  }
  
  async getRecentSessions(limit: number = 5): Promise<PlanningSession[]> {
    const sessions = await this.getUserSessions();
    return sessions
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
  
  // Current Session Management
  async saveCurrentSession(data: PlanningData): Promise<void> {
    await this.saveToStorage(this.currentSessionKey, {
      data,
      savedAt: new Date().toISOString()
    });
  }
  
  async getCurrentSession(): Promise<PlanningData | null> {
    const stored = await this.loadFromStorage<{ data: PlanningData; savedAt: string } | null>(
      this.currentSessionKey, 
      null
    );
    
    if (!stored || !this.validateSessionData(stored.data)) {
      return null;
    }
    
    // Convert stored dates back to Date objects
    return this.deserializePlanningData(stored.data);
  }
  
  async clearCurrentSession(): Promise<void> {
    await this.removeFromStorage(this.currentSessionKey);
  }
  
  // User Preferences
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    await this.saveToStorage(this.preferencesKey, preferences);
  }
  
  async getUserPreferences(): Promise<UserPreferences | null> {
    return await this.loadFromStorage<UserPreferences | null>(this.preferencesKey, null);
  }
  
  // Data Validation and Migration
  validateSessionData(data: unknown): data is PlanningData {
    if (!data || typeof data !== 'object') return false;
    
    const d = data as PlanningData;
    
    // Check required structure
    return !!(
      d.personalInfo &&
      d.financialInfo &&
      d.preferences &&
      typeof d.personalInfo.currentAge === 'number' &&
      typeof d.personalInfo.targetRetirementAge === 'number' &&
      typeof d.personalInfo.lifeExpectancy === 'number' &&
      typeof d.personalInfo.investorProfile === 'string' &&
      d.financialInfo.initialAmount &&
      d.financialInfo.monthlyContribution
    );
  }
  
  migrateSessionData(data: unknown): PlanningData {
    // Handle migration from older data formats
    const migrated: PlanningData = {
      personalInfo: {
        currentAge: (data as PlanningData).personalInfo?.currentAge || 30,
        targetRetirementAge: (data as PlanningData).personalInfo?.targetRetirementAge || 65,
        lifeExpectancy: (data as PlanningData).personalInfo?.lifeExpectancy || 85,
        investorProfile: (data as PlanningData).personalInfo?.investorProfile || 'moderado'
      },
      financialInfo: {
        initialAmount: this.ensureMoneyObject(data as PlanningData).financialInfo?.initialAmount || Money.zero(),
        monthlyContribution: this.ensureMoneyObject(data as PlanningData).financialInfo?.monthlyContribution || Money.zero(),
        targetRetirementIncome: (data as PlanningData).financialInfo?.targetRetirementIncome ? this.ensureMoneyObject(data as PlanningData).financialInfo?.targetRetirementIncome : undefined,
        currentSavings: (data as PlanningData).financialInfo?.currentSavings ? this.ensureMoneyObject(data as PlanningData).financialInfo?.currentSavings : undefined
      },
      preferences: {
        riskTolerance: (data as PlanningData).preferences?.riskTolerance || 'medium',
        prioritizeGrowth: (data as PlanningData).preferences?.prioritizeGrowth ?? true,
        considerInflation: (data as PlanningData).preferences?.considerInflation ?? true,
        inflationRate: (data as PlanningData).preferences?.inflationRate || 0.04
      }
    };
    
    if ((data as PlanningData).calculationResults) {
      migrated.calculationResults = {
        lastCalculatedAt: new Date((data as PlanningData).calculationResults.lastCalculatedAt),
        projectedWealth: this.ensureMoneyObject(data as PlanningData).calculationResults?.projectedWealth || Money.zero(),
        sustainableIncome: this.ensureMoneyObject(data as PlanningData).calculationResults?.sustainableIncome || Money.zero(),
        successProbability: (data as PlanningData).calculationResults?.successProbability || 0
      };
    }
    
    return migrated;
  }
  
  // Private Helper Methods
  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }
  
  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (_error) {
      // Failed to save to localStorage
    }
  }
  
  private loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = localStorage.getItem(key);
      if (!item) return Promise.resolve(defaultValue);
      
      return Promise.resolve(JSON.parse(item) as T);
    } catch (_error) {
      // Failed to load from localStorage
      return Promise.resolve(defaultValue);
    }
  }
  
  private async removeFromStorage(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
  
  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getDefaultPlanningData(): PlanningData {
    return {
      personalInfo: {
        currentAge: 30,
        targetRetirementAge: 65,
        lifeExpectancy: 85,
        investorProfile: 'moderado'
      },
      financialInfo: {
        initialAmount: Money.zero(),
        monthlyContribution: Money.zero()
      },
      preferences: {
        riskTolerance: 'medium',
        prioritizeGrowth: true,
        considerInflation: true,
        inflationRate: 0.04
      }
    };
  }
  
  private ensureMoneyObject(value: unknown): Money {
    if (value instanceof Money) return value;
    
    if (typeof value === 'object' && value !== null && 'amount' in value && 'currency' in value) {
      return Money.fromNumber((value as { amount: number; currency: string }).amount, (value as { currency: string }).currency || 'BRL');
    }
    
    if (typeof value === 'number') {
      return Money.fromNumber(value);
    }
    
    return Money.zero();
  }
  
  private deserializePlanningData(data: unknown): PlanningData {
    const result = { ...data };
    
    // Convert Money objects
    if (result.financialInfo) {
      result.financialInfo.initialAmount = this.ensureMoneyObject(result.financialInfo.initialAmount);
      result.financialInfo.monthlyContribution = this.ensureMoneyObject(result.financialInfo.monthlyContribution);
      
      if (result.financialInfo.targetRetirementIncome) {
        result.financialInfo.targetRetirementIncome = this.ensureMoneyObject(result.financialInfo.targetRetirementIncome);
      }
      
      if (result.financialInfo.currentSavings) {
        result.financialInfo.currentSavings = this.ensureMoneyObject(result.financialInfo.currentSavings);
      }
    }
    
    // Convert calculation results
    if (result.calculationResults) {
      result.calculationResults.lastCalculatedAt = new Date(result.calculationResults.lastCalculatedAt);
      result.calculationResults.projectedWealth = this.ensureMoneyObject(result.calculationResults.projectedWealth);
      result.calculationResults.sustainableIncome = this.ensureMoneyObject(result.calculationResults.sustainableIncome);
    }
    
    return result as PlanningData;
  }
}

// Export singleton instance
export const planningDataRepository = new LocalStoragePlanningDataRepository();