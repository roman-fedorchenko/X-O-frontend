import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainMenu from './pages/main_menu';
import GameOffline from './pages/game_offline';
import Test from './pages/test';
import AuthSuccess from './pages/AuthSuccess'; // Створимо цей файл нижче

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Перевіряємо при завантаженні, чи є токен
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Тут можна зробити запит до вашого сервера /api/me, щоб отримати дані юзера
      // Поки що просто ставимо true для спрощення
      setUser({ loggedIn: true });
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="loader">Завантаження...</div>;

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Головне меню */}
          <Route path="/" element={<MainMenu user={user} />} />
          
          {/* Сторінка, куди Google поверне нас із токеном */}
          <Route path="/auth-success" element={<AuthSuccess setUser={setUser} />} />

          {/* Приклад захищеного маршруту для гри онлайн */}
          <Route 
            path="/play-players" 
            element={user ? <h1 style={{color: 'white', fontFamily: 'Chela One'}}>Game Starts! 🎮</h1> : <Navigate to="/" />} 
          />

          <Route path="/game_ofline" element={<GameOffline />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;