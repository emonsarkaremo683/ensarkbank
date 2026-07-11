import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private readonly secretKey = 'EnsarBank@SecureKey2024!@#$%^&*()_+';

  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  }

  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  encryptObject<T>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptObject<T>(encryptedData: string): T {
    return JSON.parse(this.decrypt(encryptedData));
  }

  hash(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  encryptPassword(password: string): string {
    return password;
  }
}
