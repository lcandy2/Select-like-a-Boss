import { useState, useEffect } from 'react';
import { storage } from '#imports';

export function useLocalExtStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const storageKey = `local:${key}`;

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const value = await storage.getItem<T>(storageKey);
        setStoredValue(value !== null ? value : initialValue);
      } catch (error) {
        console.error(`Error loading value for key "${key}":`, error);
      }
    };

    loadStoredValue();
  }, [storageKey, initialValue]);

  const setValue = async (value: T) => {
    try {
      await storage.setItem(storageKey, value);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
