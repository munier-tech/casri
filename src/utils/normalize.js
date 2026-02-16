export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (typeof value === 'object') return Object.values(value);
  return [];
}

export function pickList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.categories)) return data.categories;
  if (typeof data === 'object') return Object.values(data);
  return [];
}

export function pickEntity(data) {
  if (!data) return null;
  if (data.product) return data.product;
  if (data.category) return data.category;
  if (data.data && typeof data.data === 'object') return data.data;
  return data;
}

export function getId(entity) {
  return entity?.id ?? entity?._id ?? entity?.uuid ?? null;
}
