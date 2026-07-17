import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface JwtPayload {
  sub: string;
  kullaniciKodu: string;
  firmaId?: number;
  donemId?: number;
  subeId?: number;
  kasaId?: number;
  depoId?: number | null;
}

export function tokenUret(
  kullaniciId: number,
  kullaniciKodu: string,
  oturum?: Omit<JwtPayload, 'sub' | 'kullaniciKodu'>
): string {
  return jwt.sign({ sub: String(kullaniciId), kullaniciKodu, ...oturum }, config.jwtSecret, {
    expiresIn: `${config.jwtSureGun}d`,
  });
}

export function tokenDogrula(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
