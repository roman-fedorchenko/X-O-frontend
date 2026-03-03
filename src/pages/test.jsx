import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Замініть на ваш реальний URL з Koyeb
const SOCKET_SERVER_URL = "https://supposed-katharyn-fun-tests-projets-a644ad4b.koyeb.app/";

function Test() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('Очікування дії...');
  const [matchData, setMatchData] = useState(null);

  // Ініціалізація сокета
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected with ID:', newSocket.id);
    });

    newSocket.on('match_found', (data) => {
      console.log('Match found!', data);
      setMatchData(data);
      setStatus(`Гра знайдена! Суперник: ${data.opponent}. Кімната: ${data.roomId}`);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Тестова функція реєстрації (HTTP)
  const handleRegister = async () => {
    try {
      setStatus('Реєстрація...');
      const response = await fetch(`${SOCKET_SERVER_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Tester_" + Math.floor(Math.random() * 1000),
          email: `test${Date.now()}@test.com`,
          password: "password123"
        })
      });
      const data = await response.json();
      setStatus(data.success ? `Успіх! Вітаємо, ${data.user.name}` : 'Помилка реєстрації');
    } catch (err) {
      setStatus('Помилка з\'єднання з сервером');
    }
  };

  // Функція пошуку гри (Socket)
  const handleJoinQueue = () => {
    if (socket) {
      setStatus('У черзі на гру...');
      socket.emit('join_queue', { name: "Player_" + socket.id.substring(0, 4), rang: 1000 });
    }
  };

  return (
    <div className="main-menu" style={{ padding: '20px', textAlign: 'center' }}>
      <img className="logo" src="/logos/main_logo.png" alt="Tic Tac Toe Logo" style={{ width: '100px' }} />
      
      <h2>Панель тестування</h2>
      <p><strong>Статус:</strong> {status}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
        <button onClick={handleRegister}>1. Тест Реєстрації (POST)</button>
        <button onClick={handleJoinQueue} disabled={matchData}>2. Почати пошук гри (Socket)</button>
      </div>

      {matchData && (
        <div style={{ marginTop: '20px', border: '1px solid green', padding: '10px' }}>
          <h3>Дані матчу:</h3>
          <p>Кімната: {matchData.roomId}</p>
          <p>Ваша сторона: <strong>{matchData.side}</strong></p>
        </div>
      )}
    </div>
  );
}

export default Test;