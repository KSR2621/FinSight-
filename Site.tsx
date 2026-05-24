import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import App from './App';
import LandingPage from './components/LandingPage';
import SignupPage from './components/SignupPage';
import { User } from './types';

const Site: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('finsight_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
  }, []);

  const handleSignup = (user: User) => {
    setCurrentUser(user);
    setShowSignup(false);
  };

  if (currentUser) {
    return (
      <HashRouter>
        <App user={currentUser} />
      </HashRouter>
    );
  }

  if (showSignup) {
    return <SignupPage onSignup={handleSignup} onBack={() => setShowSignup(false)} />;
  }
  
  return <LandingPage onLaunchApp={() => setShowSignup(true)} />;
};

export default Site;
