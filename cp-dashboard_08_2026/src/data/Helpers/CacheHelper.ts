import { atom } from 'jotai';

export interface CacheItem {
  cacheKey: string;
  updateDate: string;
  description: string;
}

export const cacheAtom = atom<CacheItem[]>([]);

export const loadCacheItems = async () => {
  const response = await import('../cache-dates.json');
  return response.default as CacheItem[];
};

export const getFromCache = (key: string): any | null => {
  const cached = localStorage.getItem(key);

  if (cached) {
    try {
      const cacheItem = JSON.parse(cached);
      if (cacheItem && cacheItem.cacheDate) {
        return cacheItem.data;
      }
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  }
};

export const isCachedItemExpired = (key: string, cacheItems: CacheItem[]): boolean => {
  const updateDate = cacheItems.find((item) => item.cacheKey === key)?.updateDate;
  if (!updateDate) {
    return true;
  }
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      const cacheItem = JSON.parse(cached);
      if (cacheItem && cacheItem.cacheDate) {
        return new Date(cacheItem.cacheDate) < new Date(updateDate);
      }
    } catch {
      localStorage.removeItem(key);
    }
  }
  return true;
};
