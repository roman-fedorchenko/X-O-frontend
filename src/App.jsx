import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// --- CSS STYLES (Вбудовані для зручності "OneFile") ---
const styles = `
  /* Імпорт шрифту */
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

  :root {
    --bg-blue: #3644E8;
    --btn-beige: #D6C2A5;
    --btn-shadow: #8C7B66;
    --text-brown: #4A3B2A;
    --white: #ffffff;
    --accent-red: #FF4757;
  }

  * {
    box-sizing: border-box;
    user-select: none; /* Забороняємо виділення тексту (важливо для гри на телефоні) */
  }

  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden; /* Запобігаємо горизонтальному скролу */
    font-family: 'Fredoka One', cursive;
    -webkit-tap-highlight-color: transparent; /* Прибирає синій клік на Android */
  }

  /* Головний контейнер */
  .app-container {
    background-color: var(--bg-blue);
    min-height: 100vh;
    min-height: 100dvh; /* Адаптація під мобільні браузери */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  /* --- LOGO --- */
  .logo-container {
    margin-bottom: clamp(20px, 5vh, 50px); /* Адаптивний відступ */
    text-align: center;
  }

  .game-logo {
    width: 100%;
    max-width: 350px; /* Максимум на десктопі */
    min-width: 200px; /* Мінімум на старих телефонах */
    height: auto;
    filter: drop-shadow(0px 8px 0px rgba(0,0,0,0.2));
    transition: transform 0.3s ease;
  }
  
  .game-logo:hover {
    transform: scale(1.05) rotate(-2deg);
  }

  /* --- MENU --- */
  .menu-box {
    width: 100%;
    max-width: 320px; /* Оптимальна ширина для кнопок */
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  /* 3D Кнопки */
  .cartoon-btn {
    position: relative;
    background-color: var(--btn-beige);
    color: var(--text-brown);
    border: none;
    border-radius: 16px;
    padding: 16px 20px;
    font-size: clamp(1rem, 4vw, 1.4rem); /* Шрифт адаптується від 16px до 22px */
    font-family: inherit;
    cursor: pointer;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 1px;
    
    /* Тінь для 3D ефекту */
    box-shadow: 0px 6px 0px var(--btn-shadow), 
                0px 12px 20px rgba(0,0,0,0.25);
    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .cartoon-btn:active {
    transform: translateY(4px);
    box-shadow: 0px 2px 0px var(--btn-shadow),
                0px 6px 10px rgba(0,0,0,0.2);
  }

  /* --- GAME BOARD (Адаптивність) --- */
  .game-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    background-color: rgba(0, 0, 0, 0.2);
    padding: 15px;
    border-radius: 20px;
    
    /* Робимо дошку квадратною і адаптивною */
    width: 90vw;
    max-width: 400px;
    aspect-ratio: 1 / 1; 
  }

  .square {
    background-color: var(--white);
    border-radius: 12px;
    border: none;
    font-size: clamp(2rem, 10vw, 4rem); /* Величезні X та O */
    color: var(--bg-blue);
    font-family: inherit;
    cursor: pointer;
    box-shadow: inset 0px -4px 0px #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .square.x { color: var(--accent-red); }
  .square.o { color: var(--bg-blue); }

  .square:active {
    background-color: #F5F5F5;
    box-shadow: inset 0px 4px 0px rgba(0,0,0,0.1);
  }

  .back-btn {
    margin-top: 30px;
    background-color: var(--accent-red);
    color: white;
    box-shadow: 0px 6px 0px #C41E3A, 0px 10px 15px rgba(0,0,0,0.2);
  }
  
  .back-btn:active {
     box-shadow: 0px 2px 0px #C41E3A;
  }

  /* Текст статусу */
  .status-text {
    color: white;
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-shadow: 0px 3px 0px rgba(0,0,0,0.2);
  }

  /* --- ANIMATIONS --- */
  @keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }

  .menu-box, .game-board {
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
`;

// --- COMPONENTS ---

const MenuButton = ({ text, onClick, variant = 'primary' }) => (
  <button 
    className={`cartoon-btn ${variant === 'secondary' ? 'back-btn' : ''}`} 
    onClick={onClick}
  >
    {text}
  </button>
);

const GameBoard = ({ onBack }) => {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const handleClick = (i) => {
    if (squares[i] || calculateWinner(squares)) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  const winner = calculateWinner(squares);
  const status = winner 
    ? `Winner: ${winner}` 
    : `Next player: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
      <div className="status-text">{status}</div>
      <div className="game-board">
        {squares.map((val, i) => (
          <button 
            key={i} 
            className={`square ${val ? val.toLowerCase() : ''}`} 
            onClick={() => handleClick(i)}
          >
            {val}
          </button>
        ))}
      </div>
      <div style={{marginTop: '20px', width: '100%', maxWidth: '320px'}}>
         <MenuButton text="Back to Menu" onClick={onBack} variant="secondary" />
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState('menu'); // 'menu' | 'game'

  // Ініціалізація Socket.io (підключення до Koyeb)
  useEffect(() => {
    // ВАЖЛИВО: Для цього прев'ю ми використовуємо пряме посилання.
    // У вашому Vite проекті розкоментуйте import.meta.env і видаліть жорсткий рядок
    
    // const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
    const backendUrl = 'https://supposed-katharyn-fun-tests-projets-a644ad4b.koyeb.app';
    
    console.log('Connecting to:', backendUrl);
    
    const socket = io(backendUrl);
    
    socket.on('connect', () => console.log('Connected to backend:', socket.id));
    
    return () => socket.disconnect();
  }, []);

  return (
    <>
      <style>{styles}</style>
      <div className="app-container">
        
        {view === 'menu' && (
          <>
            <div className="logo-container">
              {/* Якщо логотипа немає, покажемо красивий текст */}
              <img 
                src="/logo.png" 
                alt="X & O" 
                className="game-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }} 
              />
              <h1 style={{display: 'none', color: 'white', fontSize: '4rem', margin: 0, textShadow: '0 5px 0 rgba(0,0,0,0.2)'}}>
                X<span style={{color:'#D6C2A5'}}>&</span>O
              </h1>
            </div>

            <div className="menu-box">
              <MenuButton text="Play with players" onClick={() => setView('game')} />
              <MenuButton text="Play with bot" onClick={() => alert('Bot mode coming soon!')} />
              <MenuButton text="History" onClick={() => alert('History coming soon!')} />
              <MenuButton text="Sign up / Login" onClick={() => alert('Login logic here')} />
            </div>
          </>
        )}

        {view === 'game' && <GameBoard onBack={() => setView('menu')} />}
        
      </div>
    </>
  );
}

// Допоміжна функція для визначення переможця
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}