import { useEffect, useRef } from 'react';

/**
 * Custom hook to detect clicks outside of a referenced element.
 * @param {Function} handler - Function to call when a click outside occurs.
 * @returns {React.RefObject} - Ref to attach to the target container DOM element.
 */
export function useClickOutside(handler) {
  const ref = useRef(null);

  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler]);

  return ref;
}
