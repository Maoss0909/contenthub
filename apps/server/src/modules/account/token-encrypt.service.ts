import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TokenEncryptService {
  private readonly encryptionKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key || key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be set and be exactly 32 characters long',
      );
    }
    this.encryptionKey = Buffer.from(key, 'utf8');
  }

  async encrypt(
    plainText: string,
  ): Promise<{ encrypted: string; iv: string; tag: string }> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag,
    };
  }

  async decrypt(
    encrypted: string,
    iv: string,
    tag: string,
  ): Promise<string> {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.encryptionKey,
      Buffer.from(iv, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(tag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
