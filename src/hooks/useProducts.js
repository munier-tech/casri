import { useCollection } from './useCollection';
import * as svc from '../api/products';

const service = {
  fetchList: svc.fetchProducts,
  createOne: svc.createProduct,
  updateOne: svc.updateProduct,
  deleteOne: svc.deleteProduct,
  getEntityId: svc.getEntityId,
};

export function useProducts() {
  return useCollection(service);
}
