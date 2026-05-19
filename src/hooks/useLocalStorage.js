import { useState, useCallback } from 'react';

function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback(
    (next) => {
      const resolved = typeof next === 'function' ? next(value) : next;
      setValue(resolved);
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // storage unavailable — state still updates in memory
      }
    },
    [key, value]
  );

  return [value, set];
}

export default useLocalStorage;
