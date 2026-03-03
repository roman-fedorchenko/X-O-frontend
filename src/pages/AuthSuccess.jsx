import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = ({ setUser }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('token', token);
      setUser({ loggedIn: true });
      navigate('/'); // Повертаємо в головне меню
    } else {
      navigate('/'); // Якщо щось пішло не так
    }
  }, [searchParams, navigate, setUser]);

  return <div style={{color: 'white'}}>Авторизація...</div>;
};

export default AuthSuccess;