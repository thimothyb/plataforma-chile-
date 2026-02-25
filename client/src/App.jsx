import { useState, useCallback } from 'react';
import { loginUser } from './services/api';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('auth') === 'true'
  );

  const handleLogin = useCallback(async (username, password) => {
    const result = await loginUser(username, password);
    if (result.success) {
      sessionStorage.setItem('auth', 'true');
      setAuthenticated(true);
    } else {
      throw new Error(result.error || 'Credenciales incorrectas');
    }
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('auth');
    setAuthenticated(false);
  }, []);

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

export default App;
