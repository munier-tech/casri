import { api } from './client';
import { pickList, pickEntity, getId } from '../utils/normalize';

export async function fetchProducts() {
  const { data } = await api.get('/api/products');
  return pickList(data);
}

export async function createProduct(payload) {
  const { data } = await api.post('/api/products', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function updateProduct(id, changes) {
  const { data } = await api.patch(`/api/products/${id}`, changes, {
    headers: { 'Content-Type': 'application/json' },
  });
  return pickEntity(data) || null;
}

export async function deleteProduct(id) {
  await api.delete(`/api/products/${id}`);
  return true;
}

export function getEntityId(entity) {
  return getId(entity);
}
