import axios from 'axios';
import type { FieldError } from '../types';

export interface ApiErrorInfo {
  kind: 'network' | 'http' | 'unknown';
  status?: number;
  message: string;
  fieldErrors: Record<string, string>;
}

// Ubah error apa pun (jaringan / respons backend) menjadi bentuk yang seragam
export function parseApiError(err: unknown): ApiErrorInfo {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return {
        kind: 'network',
        message:
          err.code === 'ECONNABORTED'
            ? 'Permintaan terlalu lama (timeout). Coba lagi.'
            : 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.',
        fieldErrors: {},
      };
    }
    const data = err.response.data as { message?: string; errors?: FieldError[] } | string | undefined;
    const body = typeof data === 'object' && data !== null ? data : undefined;
    const fieldErrors: Record<string, string> = {};
    body?.errors?.forEach((e) => {
      if (e.field && !(e.field in fieldErrors)) fieldErrors[e.field] = e.message;
    });
    return {
      kind: 'http',
      status: err.response.status,
      message: body?.message ?? `Terjadi kesalahan (HTTP ${err.response.status})`,
      fieldErrors,
    };
  }
  return {
    kind: 'unknown',
    message: err instanceof Error ? err.message : 'Terjadi kesalahan tak terduga',
    fieldErrors: {},
  };
}
