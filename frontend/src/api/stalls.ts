import { api } from './client';
import type { ApiSuccess, PageMeta, Stall, StallInput, StallQuery } from '../types';

export const getStalls = async (query: StallQuery, signal?: AbortSignal) => {
  // buang parameter kosong supaya URL bersih
  const params = Object.fromEntries(
    Object.entries(query).filter(([, v]) => v !== undefined && v !== ''),
  );
  const res = await api.get<ApiSuccess<Stall[]>>('/stalls', { params, signal });
  return { items: res.data.data, meta: res.data.meta as PageMeta };
};

export const getStall = (id: number | string, signal?: AbortSignal) =>
  api.get<ApiSuccess<Stall>>(`/stalls/${id}`, { signal }).then((r) => r.data.data);

export const createStall = (input: StallInput) =>
  api.post<ApiSuccess<Stall>>('/stalls', input).then((r) => r.data.data);

export const updateStall = (id: number | string, input: StallInput) =>
  api.put<ApiSuccess<Stall>>(`/stalls/${id}`, input).then((r) => r.data.data);

export const deleteStall = (id: number | string) =>
  api.delete<ApiSuccess<null>>(`/stalls/${id}`).then((r) => r.data);
