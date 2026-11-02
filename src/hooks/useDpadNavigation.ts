import { useEffect } from 'react';

export function useDpadNavigation() {
  useEffect(() => {
    // Adds a class to highlight TV focus when remote control keys are pressed
    const handleKeyDown = (e: KeyboardEvent) => {
      const tvKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
      if (tvKeys.includes(e.key)) {
        document.body.classList.add('tv-remote-mode');
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove('tv-remote-mode');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

