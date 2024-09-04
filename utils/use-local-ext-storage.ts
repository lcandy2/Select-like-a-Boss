import { useState, useEffect } from 'react';
import { localExtStorage } from '@webext-core/storage';

export function useLocalExtStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const value = await localExtStorage.getItem(key);
        setStoredValue(value !== null ? value : initialValue);
      } catch (error) {
        console.error(`Error loading value for key "${key}":`, error);
      }
    };

    loadStoredValue();
  }, [key, initialValue]);

  const setValue = async (value: T) => {
    try {
      await localExtStorage.setItem(key, value);
      setStoredValue(value);
    } catch (error) {
      console.error(`Error setting value for key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
