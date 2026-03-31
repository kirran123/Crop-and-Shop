import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionManager = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Time boundaries
  const INACTIVITY_LIMIT_MS = 3 * 60 * 1000; // 3 minutes
  const BROWSER_CLOSED_LIMIT_MS = 60 * 1000; // 1 minute

  // Function to wipe session natively
  const logoutSession = (reason) => {
    console.warn(`System logout triggered: ${reason}`);
    localStorage.removeItem('userName');
    localStorage.removeItem('lastActiveTime');
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    // 1. Bypass timer completely if already on the login screen
    if (location.pathname === '/login' || location.pathname === '/') {
        return;
    }

    // 2. Closed-Browser Validation (1-Minute rule execution on startup)
    // If the browser was closed, JS paused, and `lastActiveTime` hasn't updated. 
    // When the user opens the tab back up, this will be tested.
    const lastActive = localStorage.getItem('lastActiveTime');
    const now = Date.now();
    if (lastActive) {
      if (now - parseInt(lastActive, 10) > BROWSER_CLOSED_LIMIT_MS) {
        logoutSession("Browser was closed or tab suspended for > 1 minute.");
        return;
      }
    }

    // 3. User Interaction Pulse Update
    const tickActivity = () => {
      localStorage.setItem('lastActiveTime', Date.now().toString());
    };

    tickActivity(); // Force timestamp baseline on mount

    const interactEvents = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    interactEvents.forEach(evt => window.addEventListener(evt, tickActivity));

    // 4. Background Idle Evaluator (3-Minute check)
    // Examines real-time delta between absolute time and the last heartbeat.
    const idleCheckInterval = setInterval(() => {
      const currentTick = localStorage.getItem('lastActiveTime');
      if (currentTick && Date.now() - parseInt(currentTick, 10) > INACTIVITY_LIMIT_MS) {
        logoutSession("Detected 3 minutes of total peripheral inactivity.");
      }
    }, 5000);

    // 5. Cleanup memory allocations upon unmout
    return () => {
      interactEvents.forEach(evt => window.removeEventListener(evt, tickActivity));
      clearInterval(idleCheckInterval);
    };
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default SessionManager;
