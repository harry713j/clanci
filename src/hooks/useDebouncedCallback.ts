import { useRef, useCallback } from "react";

//we are storing the timeoutId in useRef hook because it doesn't cause re-render and it's value persist across renders

export const useDebouncedCallback = (
  callback: (...args: any[]) => void,
  delay: number
) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: any[]) => {
      // clear previous timeout if exists
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      // set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // clean up timeout on unmount
  useCallback(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
