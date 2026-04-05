import { useCallback, useEffect, useMemo, useState } from 'react';
import { toArray } from '../utils/normalize';

export function useCollection(service) {
  const [list, setList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await service.fetchList();
      setList(toArray(items));
    } catch (e) {
      setError(e);
      setList([]);
    } finally {
      setIsLoading(false);
    }
  }, [service]);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (payload) => {
    try {
      const created = await service.createOne(payload);
      if (!created) { await load(); return null; }
      const id = service.getEntityId(created);
      setList(prev => {
        const next = toArray(prev);
        return id != null && next.some(x => service.getEntityId(x) === id) ? next : [created, ...next];
      });
      return created;
    } catch (e) {
      setError(e);
      await load();
      return null;
    }
  }, [service, load]);

  const update = useCallback(async (id, changes) => {
    try {
      const updated = await service.updateOne(id, changes);
      if (!updated) { await load(); return null; }
      const updatedId = service.getEntityId(updated) ?? id;
      setList(prev => toArray(prev).map(item =>
        service.getEntityId(item) === updatedId ? { ...item, ...updated } : item
      ));
      return updated;
    } catch (e) {
      setError(e);
      await load();
      return null;
    }
  }, [service, load]);

  const remove = useCallback(async (id) => {
    try {
      await service.deleteOne(id);
      setList(prev => toArray(prev).filter(item => service.getEntityId(item) !== id));
      return true;
    } catch (e) {
      setError(e);
      await load();
      return false;
    }
  }, [service, load]);

  return {
    list: useMemo(() => toArray(list), [list]),
    isLoading,
    error,
    reload: load,
    create,
    update,
    remove,
  };
}
