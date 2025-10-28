import React, { useState, useCallback } from 'react';
import App from './App';
import LandingPage from './components/LandingPage';

const Site: React.FC = () => {
  const [isAppVisible, setIsAppVisible] = useState(false);

  const handleLogin = useCallback(() => {
    setIsAppVisible(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAppVisible(false);
  }, []);

  if (isAppVisible) {
    return <App onLogout={handleLogout} />;
  }

  return <LandingPage onLogin={handleLogin} />;
};

export default Site;