import { useEffect } from 'react';

/**
 * Custom hook for App effects and side effects
 * Handles all useEffect logic and global function exposure
 */
export default function useAppEffects({
  state,
  actions,
  handlers
}) {
  // Handle help toggle from F1 key
  useEffect(() => {
    const handleToggleHelp = () => {
      actions.setShowHelp(prev => !prev);
      // Also toggle the help overlay visibility
      actions.setComponentVisibility(prev => ({
        ...prev,
        helpOverlay: !prev.helpOverlay
      }));
    };

    const handleResize = () => {
      actions.setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('toggleHelp', handleToggleHelp);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });

    // Expose loadSceneData function globally
    window.loadSceneData = handlers.loadSceneData;

    // Load data from localStorage on component mount
    handlers.loadFromLocalStorage();

    return () => {
      window.removeEventListener('toggleHelp', handleToggleHelp);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      delete window.loadSceneData;
    };
  }, [actions, handlers]);
}
