import React, { createContext, useState } from 'react';

interface CacheContextType {
  cache: { [key: string]: JSX.Element | null };
  setCache: React.Dispatch<React.SetStateAction<{ [key: string]: JSX.Element | null }>>;
  children: React.ReactNode;
}

export const RouteCacheContext = createContext<CacheContextType>({
  cache: {},
  setCache: () => {},
  children: null,
});

export const RouteCacheProvider: React.FC<CacheContextType> = ({ children }) => {
  const [cache, setCache] = useState<{ [key: string]: JSX.Element | null }>({});

  return (
    <RouteCacheContext.Provider value={{ cache, setCache, children }}>
      {children}
    </RouteCacheContext.Provider>
  );
};
