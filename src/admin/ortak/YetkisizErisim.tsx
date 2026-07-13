interface YetkisizErisimProps {
  baslik?: string;
  aciklama: string;
}

export function YetkisizErisim({
  baslik = 'Yetkisiz Erişim',
  aciklama,
}: YetkisizErisimProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <p className="text-4xl" aria-hidden>
        🔒
      </p>
      <h1 className="ap-heading mt-4 text-xl font-bold">{baslik}</h1>
      <p className="ap-muted mt-2 max-w-md text-sm">{aciklama}</p>
    </div>
  );
}
