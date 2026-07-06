export interface TanimlarSubeDepartmanKaydi {
  subeNo: string;
  departmanNo: string;
  /** Atama yapıldıysa alanlar kilitlenir */
  atanmis: boolean;
}

export function bosSubeDepartmanKaydi(): TanimlarSubeDepartmanKaydi {
  return { subeNo: '', departmanNo: '', atanmis: false };
}

export function subeDepartmanKopyala(k: TanimlarSubeDepartmanKaydi): TanimlarSubeDepartmanKaydi {
  return { ...k };
}
