import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtPayload {
  sub: string;
  kullaniciKodu: string;
}

export function tokenUret(kullaniciId: number, kullaniciKodu: string): string {
  return jwt.sign({ sub: String(kullaniciId), kullaniciKodu }, config.jwtSecret, {
    expiresIn: `${config.jwtSureGun}d`,
  });
}

export function tokenDogrula(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
