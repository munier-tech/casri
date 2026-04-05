import { useCollection } from './useCollection';
import * as svc from '../api/categories';

const service = {
  fetchList: svc.fetchCategories,
  createOne: svc.createCategory,
  updateOne: svc.updateCategory,
  deleteOne: svc.deleteCategory,
  getEntityId: svc.getEntityId,
};

export function useCategories() {
  return useCollection(service);
}
