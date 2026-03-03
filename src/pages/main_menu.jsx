import React from 'react';
import { Link } from 'react-router-dom';

function MainMenu({ user }) {
  
  const handleGoogleLogin = () => {
    // Ведемо користувача на ваш ендпоїнт на Koyeb
    window.location.href = 'https://supposed-katharyn-fun-tests-projets-a644ad4b.koyeb.app/auth/google';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Перезавантажуємо, щоб скинути стан App.jsx
  };

  return (
    <div className="main-menu">
      <img className="logo" src="/logos/main_logo.png" alt="Tic Tac Toe Logo" />
      
      {/* Кнопка гри з гравцями доступна завжди, але в App.jsx ми зробили перевірку */}
      <Link to="/play-players" className="menu-btn">Play with players</Link>
      
      <Link to="/game_ofline" className="menu-btn">Play with bot</Link>
      
      <Link to="/history" className="menu-btn">History</Link>

      {/* ЛОГІКА КНОПКИ РЕЄСТРАЦІЇ/ВХОДУ */}
      {!user ? (
        <button onClick={handleGoogleLogin} className="menu-btn google-btn">
          Sign up with Google
        </button>
      ) : (
        <>
          <div className="user-info" style={{ color: 'white', margin: '10px 0' }}>
            Welcome back! 🎮
          </div>
          <button onClick={handleLogout} className="menu-btn logout-btn">
            Logout
          </button>
        </>
      )}

      <Link to="/test" className="menu-btn">Test</Link>
    </div>
  );
}

export default MainMenu;