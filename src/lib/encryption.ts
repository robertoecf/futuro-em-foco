// Simple encryption utility for localStorage data
class SimpleEncryption {
  private key: string;

  constructor() {
    // Generate or retrieve a client-side key
    this.key = this.getOrCreateKey();
  }

  private getOrCreateKey(): string {
    let key = localStorage.getItem('app_key');
    if (!key) {
      key = this.generateKey();
      localStorage.setItem('app_key', key);
    }
    return key;
  }

  private generateKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  }

  private xorDecrypt(encryptedText: string, key: string): string {
    try {
      const decoded = atob(encryptedText);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch {
      return '';
    }
  }

  encrypt<T>(data: T): string {
    const jsonString = JSON.stringify(data);
    return this.xorEncrypt(jsonString, this.key);
  }

  decrypt<T>(encryptedData: string): T | null {
    const decrypted = this.xorDecrypt(encryptedData, this.key);
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return null;
    }
  }
}

export const encryption = new SimpleEncryption();
