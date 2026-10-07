// Mengecek apakah error berasal dari aturan relasi (FOREIGN KEY) di SQL Server
export const isForeignKeyError = (err: unknown): boolean => {
  const e = err as any;
  const number = e?.number ?? e?.cause?.number ?? e?.cause?.originalError?.number;
  const text = `${e?.message ?? ''} ${e?.cause?.message ?? ''}`;
  return number === 547 || /FOREIGN KEY|REFERENCE constraint/i.test(text);
};