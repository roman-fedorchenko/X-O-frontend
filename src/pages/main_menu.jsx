import React from 'react';
import { Link } from 'react-router-dom';

function MainMenu() {
  return (
    <div className="main-menu">
      <img className="logo" src="/logos/main_logo.png" alt="Tic Tac Toe Logo" />
      {/* Кнопки тепер поводяться як посилання без перезавантаження */}
      <Link to="/play-players" className="menu-btn">Play with players</Link>
      <Link to="/play-computer" className="menu-btn">Play with computer</Link>
      <Link to="/history" className="menu-btn">History</Link>
      <Link to="/signup" className="menu-btn">Sign up</Link>
    </div>
  );
}

export default MainMenu;