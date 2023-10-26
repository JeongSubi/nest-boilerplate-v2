import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt, { Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';

@Injectable()
export class JwtService {
  private privateKey: string;
  private publicKey: string;

  constructor(@Inject('CONFIG_OPTIONS') private options) {
    this.publicKey = options.publicKey;
    this.privateKey = options.privateKey;
  }

  createToken(payload: any, options: SignOptions, secret: Secret = this.privateKey): string {
    try {
      return jwt.sign(payload, secret, options);
    } catch (error) {
      throw error;
    }
  }

  decodeToken(token: string, options: VerifyOptions, secret: Secret = this.publicKey): any {
    try {
      return jwt.verify(token, secret, options);
    } catch (error) {
      throw new UnauthorizedException('invalid_token');
    }
  }
}
