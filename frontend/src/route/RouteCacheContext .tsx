import React, { createContext, useState } from 'react';

interface CacheContextType {
  cache: { [key: string]: JSX.Element | null };
  setCache: React.Dispatch<React.SetStateAction<{ [key: string]: JSX.Element | null }>>;
}

export const RouteCacheContext = createContext<CacheContextType>({
  cache: {},
  setCache: () => {},
});
