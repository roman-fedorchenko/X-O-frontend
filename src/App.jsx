import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// --- CSS СТИЛІ ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');

  :root {
    --bg-blue: #3644E8;
    --bg-dark: #1E1E1E;
    --btn-beige: #D6C2A5;
    --btn-shadow: #8C7B66;
    --text-brown: #4A3B2A;
    --white: #ffffff;
    --accent-red: #FF4757;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
  }

  body, html {
    width: 100%;
    height: 100%;
    font-family: 'Fredoka One', cursive;
    overflow: hidden; /* Запобігаємо скролу всього тіла */
  }

  /* Головна обгортка */
  .app-wrapper {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    background-color: var(--bg-dark);
  }

  /* Бічна панель (Sidebar) */
  .sidebar {
    width: 320px;
    min-width: 320px;
    background-color: var(--bg-blue);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    z-index: 10;
    box-shadow: 10px 0 30px rgba(0,0,0,0.3);
  }

  /* Основна ігрова зона */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto; /* Дозволяємо скрол тільки тут, якщо екран дуже малий */
  }

  /* Адаптація під мобільні */
  @media (max-width: 850px) {
    .app-wrapper {
      flex-direction: column;
    }
    .sidebar {
      width: 100%;
      min-width: 100%;
      height: auto;
      min-height: 200px;
      padding: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
  }

  /* --- LOGO --- */
  .logo-container {
    margin-bottom: clamp(20px, 4vh, 40px);
    text-align: center;
  }

  .game-logo-img {
    width: 140px;
    height: auto;
    filter: drop-shadow(0px 8px 0px rgba(0,0,0,0.2));
  }

  .logo-fallback {
    color: white;
    font-size: 3rem;
    text-shadow: 0 5px 0 rgba(0,0,0,0.2);
  }

  /* --- MENU --- */
  .menu-box {
    width: 100%;
    max-width: 260px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .cartoon-btn {
    background-color: var(--btn-beige);
    color: var(--text-brown);
    border: none;
    border-radius: 12px;
    padding: 14px 10px;
    font-size: 1rem;
    font-family: inherit;
    cursor: pointer;
    width: 100%;
    text-transform: uppercase;
    box-shadow: 0px 5px 0px var(--btn-shadow);
    transition: transform 0.1s, box-shadow 0.1s;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .cartoon-btn:active {
    transform: translateY(3px);
    box-shadow: 0px 2px 0px var(--btn-shadow);
  }

  /* --- GAME ELEMENTS --- */
  .status-wrapper {
    width: 100%;
    height: 80px; /* Фіксована висота запобігає "стрибкам" дошки */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }

  .status-text {
    color: white;
    font-size: clamp(1.5rem, 4vw, 2.2rem);
    text-align: center;
  }

  /* Контейнер дошки для стабілізації */
  .board-container {
    width: 100%;
    max-width: 480px;
    aspect-ratio: 1 / 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 12px;
    background-color: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 24px;
    width: 100%;
    height: 100%;
  }

  .square {
    background-color: #2A2A2A;
    border-radius: 16px;
    border: 3px solid #3d3d3d;
    font-size: clamp(2rem, 10vw, 5rem);
    font-family: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: inset 0px -4px 0px rgba(0,0,0,0.2);
  }

  .square:hover { 
    background-color: #333;
    border-color: #555;
  }
  
  .square.x { color: var(--accent-red); }
  .square.o { color: #00E5FF; }

  .square:active {
    transform: scale(0.95);
    background-color: #222;
  }

  .controls-footer {
    margin-top: 30px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .back-btn {
    max-width: 180px;
    background-color: var(--accent-red);
    color: white;
    box-shadow: 0px 5px 0px #C41E3A;
  }
`;

// --- ЛОГІКА ГРИ ---

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
  return squares.includes(null) ? null : 'Draw';
}

const Square = ({ value, onClick }) => (
  <button className={`square ${value ? value.toLowerCase() : ''}`} onClick={onClick}>
    {value}
  </button>
);

// --- ОСНОВНИЙ КОМПОНЕНТ ---

export default function App() {
  const [view, setView] = useState('menu'); 
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  useEffect(() => {
    // URL вашого бекенду на Koyeb
    const backendUrl = 'https://supposed-katharyn-fun-tests-projets-a644ad4b.koyeb.app';
    const socket = io(backendUrl);
    socket.on('connect', () => console.log('Connected to socket:', socket.id));
    return () => socket.disconnect();
  }, []);

  const handleSquareClick = (i) => {
    if (squares[i] || calculateWinner(squares)) return;
    const next = squares.slice();
    next[i] = xIsNext ? 'X' : 'O';
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const winner = calculateWinner(squares);
  const status = winner === 'Draw' 
    ? "It's a Draw!" 
    : winner 
      ? `Winner: ${winner}` 
      : `Next: ${xIsNext ? 'X' : 'O'}`;

  return (
    <div className="app-wrapper">
      <style>{styles}</style>

      {/* Сайдбар - стабільний зліва */}
      <aside className="sidebar">
        <div className="logo-container">
          <img src="/logo.png" alt="X&O" className="game-logo-img" onError={(e) => e.target.style.display='none'} />
          <h1 className="logo-fallback">X&O</h1>
        </div>

        <div className="menu-box">
          <button className="cartoon-btn" onClick={() => { setView('game'); resetGame(); }}>Play with players</button>
          <button className="cartoon-btn" onClick={() => alert('Bot logic here soon!')}>Play with bot</button>
          <button className="cartoon-btn" onClick={() => alert('Match history here soon!')}>History</button>
          <button className="cartoon-btn" onClick={() => alert('Auth screen here soon!')}>Sign Up / Login</button>
        </div>
      </aside>

      {/* Ігрова область - центр */}
      <main className="main-content">
        {view === 'game' ? (
          <>
            <div className="status-wrapper">
              <h2 className="status-text">{status}</h2>
            </div>
            
            <div className="board-container">
              <div className="game-board">
                {squares.map((val, i) => (
                  <Square key={i} value={val} onClick={() => handleSquareClick(i)} />
                ))}
              </div>
            </div>

            <div className="controls-footer">
              <button className="cartoon-btn back-btn" onClick={() => setView('menu')}>Back to Menu</button>
            </div>
          </>
        ) : (
          <div className="status-text" style={{opacity: 0.3}}>Please select a game mode</div>
        )}
      </main>
    </div>
  );
}