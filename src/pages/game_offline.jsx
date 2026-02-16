import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './game.css';

// --- 1. Логіка перевірки переможця (без змін) ---
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function minimax(board, depth, isMaximizing) {
  const winner = calculateWinner(board);
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (board.every(square => square !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove(board) {
  let bestScore = -Infinity;
  let move = -1;
  
  if (board.filter(x => x).length === 0) return 4; 
  if (board.filter(x => x).length === 1 && !board[4]) return 4;

  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function GameOffline() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [isBotMode, setIsBotMode] = useState(true);
  
  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(square => square !== null);
  const handleMove = useCallback((index) => {
    if (winner || board[index]) return;
    
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  }, [board, isXNext, winner]);

  useEffect(() => {
    if (isBotMode && !isXNext && !winner && !isDraw) {
      const timer = setTimeout(() => {
        const botMoveIndex = getBestMove([...board]);
        if (botMoveIndex !== -1) {
          handleMove(botMoveIndex);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isXNext, isBotMode, winner, isDraw, board, handleMove]);
  const onUserClick = (index) => {
    if (isBotMode && !isXNext) return;
    handleMove(index);
  };

  let status;
  if (winner) {
    status = `Winner: <span class="winner">${winner}</span> 🏆`;
  } else if (isDraw) {
    status = "It's a Draw! 🤝";
  } else {
    status = `Next player: <span id="current-player" class="${isXNext ? 'x' : 'o'}">${isXNext ? 'X' : 'O'}</span>`;
  }

  return (
    <div className="game-offline">
      <h1 style={{color: 'white', fontFamily: 'Chela One'}}>
        {isBotMode ? "Man vs AI 🤖" : "PvP Mode 🎮"}
      </h1>
      <div className="lable-container">
        <div dangerouslySetInnerHTML={{ __html: status }} />
      </div>

      <div className="game-container">
        <div className="game-board">
          {board.map((cellValue, index) => (
            <div 
              key={index} 
              className={`cell ${cellValue ? cellValue.toLowerCase() : ""}`}
              onClick={() => onUserClick(index)}
            >
              {cellValue}
            </div>
          ))}
        </div>
      </div>
      {(winner || isDraw) && (
        <button className="menu-btn" onClick={() => {
            setBoard(Array(9).fill(null));
            setIsXNext(true);
        }}>
          Play Again
        </button>
      )}

      <Link to="/" className="menu-btn" style={{marginTop: '20px'}}>Back to Main Menu</Link>
    </div>
  );
}

export default GameOffline;