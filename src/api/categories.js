import { api } from './client';
import { pickList, pickEntity, getId } from '../utils/normalize';

export async function fetchCategories() {
  const { data } = await api.get('/api/categories');
  return pickList(data);
}

export async function createCategory(payload) {
  const { data } = await api.post('/api/categories', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function updateCategory(id, changes) {
  const { data } = await api.patch(`/api/categories/${id}`, changes, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function deleteCategory(id) {
  await api.delete(`/api/categories/${id}`);
  return true;
}

export function getEntityId(entity) {
  return getId(entity);
}
