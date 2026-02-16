import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainMenu from './pages/main_menu';
import GameOffline from './pages/game_offline';

// Заглушка для сторінки гри
const GameBoard = () => <h1 style={{color: 'white', fontFamily: 'Chela One'}}>Game Starts! 🎮</h1>;

function App() {
  return (
    <Router>
      {/* Весь додаток живе тут, фон не переривається */}
      <div className="App">
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/play-players" element={<GameBoard />} />
          <Route path="/game_ofline" element={<GameOffline />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;