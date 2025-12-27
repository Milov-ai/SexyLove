import { useEffect, useState } from "react";

/**
 * Custom hook to debounce a value.
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Update the inner state after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Default cleanup cancels the timeout if value changes (typing continues)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
