import { useEffect, useMemo, useState } from 'react';
import { toArray } from '../utils/normalize';

function getBaseUrl() {
  if (typeof import !== 'undefined' && import.meta?.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return '';
}

export function useProducts(endpointPath = '/api/products', requestInit) {
  const [raw, setRaw] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = () => {
    setIsLoading(true);
    setError(null);
    const base = getBaseUrl();
    const url = base ? `${base}${endpointPath}` : endpointPath;

    fetch(url, {
      headers: { 'Accept': 'application/json' },
      ...requestInit,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const list =
          Array.isArray(data) ? data :
          Array.isArray(data?.products) ? data.products :
          Array.isArray(data?.items) ? data.items :
          toArray(data?.products || data?.items);
        setRaw(list);
      })
      .catch((e) => {
        setError(e);
        setRaw([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { reload(); }, [endpointPath]);

  const products = useMemo(() => toArray(raw), [raw]);
  return { products, isLoading, error, reload };
}
