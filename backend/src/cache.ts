import { LRUCache } from 'lru-cache';
import { TokenData } from './types';

// Кэш на 24 часа с максимальным размером 100 элементов
const cache = new LRUCache<string, TokenData>({
  max: 100,
  ttl: 24 * 60 * 60 * 1000, // 24 часа
});

export const getFromCache = (key: string): TokenData | undefined => {
  return cache.get(key);
};

export const setCache = (key: string, data: TokenData): void => {
  cache.set(key, data);
};