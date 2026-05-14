import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import './App.css';
import ImageSearch from './components/ImageSearch';
import ParamsSearch from './components/ParamsSearch';
import RoomSearch from './components/RoomSearch';
import Results from './components/Results';
import Auth from './components/Auth';
import Favorites from './components/Favorites';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function friendlyError(err) {
  const status = err?.response?.status;
  const code = err?.response?.data?.error;
  if (!err?.response) return 'Не удалось подключиться к серверу. Проверьте, что бэкенд запущен.';
  if (status === 500 || code === 'server_error') return 'Ошибка на сервере. Попробуйте через несколько секунд.';
  if (code === 'no_furniture') return 'Не удалось распознать мебель. Загрузите более чёткое фото.';
  if (err?.response?.data?.message === 'no_results') return 'Ничего не найдено. Попробуйте изменить параметры поиска.';
  if (status === 401 || status === 422) return 'Сессия истекла. Войдите снова.';
  return err?.response?.data?.error || 'Что-то пошло не так. Попробуйте ещё раз.';
}

function SearchProgress({ progress }) {
  if (!progress) return null;
  const pct = Math.round((progress.step / progress.total) * 100);
  return (
    <div className="search-progress">
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="progress-msg">{progress.message}</p>
    </div>
  );
}

export default function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('image');
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState('search');
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [progress, setProgress] = useState(null);
  const [sid, setSid] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const socketRef = useRef(null);

  // Применяем тему на body
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // WebSocket
  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => setSid(socket.id));
    socket.on('search_progress', data => {
      setProgress(data);
      if (data.step >= data.total) setTimeout(() => setProgress(null), 1200);
    });
    return () => socket.disconnect();
  }, []);

  // Восстановление сессии
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');
    if (token && userId) {
      setUser({ id: userId, token, username });
      loadFavIds(token);
    }
  }, []);

  const loadFavIds = token =>
    axios.get(`${API_URL}/api/favorites`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setFavorites(r.data.favorites.map(f => Number(f.id))))
      .catch(() => {});

  const handleLogin = (token, userId, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('username', username || '');
    setUser({ id: userId, token, username });
    setShowAuth(false);
    loadFavIds(token);
  };

  const handleLogout = () => {
    ['token','userId','username'].forEach(k => localStorage.removeItem(k));
    setUser(null); setFavorites([]); setPage('search');
  };

  const toggleFavorite = async (furnitureId) => {
    if (!user) { setShowAuth(true); return; }
    const id = Number(furnitureId);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      if (favorites.includes(id)) {
        await axios.delete(`${API_URL}/api/favorites/${id}`, { headers });
        setFavorites(prev => prev.filter(x => x !== id));
      } else {
        await axios.post(`${API_URL}/api/favorites/${id}`, {}, { headers });
        setFavorites(prev => [...prev, id]);
      }
    } catch (err) {
      setError(friendlyError(err));
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleResults = (data, analysis) => {
    setResults(data?.length ? data : []);
    setRoomAnalysis(analysis || null);
    setError(data?.length === 0 ? 'Ничего не найдено. Попробуйте изменить параметры.' : null);
  };

  const handleError = err => {
    setError(typeof err === 'string' ? err : friendlyError(err));
    setResults([]);
  };

  const Header = () => (
    <header className="header">
      <h1>Помощник по подбору мебели</h1>
      <p>Найдите идеальную мебель по фото или характеристикам</p>
    </header>
  );

  const Nav = () => (
    <nav className="nav">
      <div className="nav-links">
        {user && <>
          <button onClick={() => setPage('search')} className="nav-btn">Поиск</button>
          <button onClick={() => setPage('favorites')} className={`nav-btn${page==='favorites'?' active-nav':''}`}>
            ★ Избранное{favorites.length > 0 && ` (${favorites.length})`}
          </button>
        </>}
      </div>
      <div className="nav-links">
        {user
          ? <><span className="nav-username">{user.username}</span>
              <button onClick={handleLogout} className="nav-btn">Выйти</button></>
          : <button onClick={() => setShowAuth(true)} className="nav-btn">Войти</button>
        }
        <button onClick={toggleTheme} className="theme-btn" title="Сменить тему">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </nav>
  );

  if (page === 'favorites' && user) return (
    <div className="App">
      <Header /><Nav />
      <main className="main">
        <Favorites user={user} favorites={favorites}
          onToggleFavorite={toggleFavorite} onBack={() => setPage('search')} />
      </main>
    </div>
  );

  const tabs = [['image','Поиск по фото'],['params','Расширенный поиск'],['room','Подбор мебели']];

  return (
    <div className="App">
      <Header /><Nav />
      <div className="tabs">
        {tabs.map(([key, label]) =>
          <button key={key} className={activeTab === key ? 'active' : ''} onClick={() => setActiveTab(key)}>
            {label}
          </button>
        )}
      </div>
      <main className="main">
        {activeTab === 'image' && <ImageSearch onResults={handleResults} onError={handleError} setLoading={setLoading} sid={sid} />}
        {activeTab === 'params' && <ParamsSearch onResults={handleResults} onError={handleError} setLoading={setLoading} />}
        {activeTab === 'room' && <RoomSearch onResults={handleResults} onError={handleError} setLoading={setLoading} sid={sid} />}

        {error && <div className="error">{error}</div>}
        {loading && <div className="loading">Обработка запроса...</div>}
        <SearchProgress progress={progress} />

        {roomAnalysis && (
          <div className="room-analysis">
            <span>Стиль: <b>{roomAnalysis.style || 'не определён'}</b></span>
            {roomAnalysis.colors?.length > 0 && <span>Цвета: <b>{roomAnalysis.colors.join(', ')}</b></span>}
          </div>
        )}
        <Results results={results} favorites={favorites} onToggleFavorite={toggleFavorite} />
      </main>
      {showAuth && <Auth onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
    </div>
  );
}
