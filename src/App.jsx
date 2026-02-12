import './App.css'; // Імпортуємо стилі
import { useState } from 'react';

function App() {
  return (
    <div className="game-container">
      {/* 1. Логотип */}
      <div className="logo-section">
        <img src="logos/main_logo.png" alt="X & O Game Logo" className="game-logo" />
      </div>

      {/* 2. Група кнопок */}
      <div className="menu-buttons">
        <MenuButton text="Play with players" />
        <MenuButton text="Play with bot" />
        <MenuButton text="History" />
        <MenuButton text="Sign up / Login" />
      </div>
    </div>
  );
}

// Ми створюємо окремий "міні-компонент" для кнопки, 
// щоб не копіювати один і той самий HTML 4 рази.
// Це і є принцип React: "Write once, use everywhere".
function MenuButton({ text, onClick }) {
  return (
    <button className="cartoon-btn" onClick={onClick}>
      {text}
    </button>
  );
}

export default App;