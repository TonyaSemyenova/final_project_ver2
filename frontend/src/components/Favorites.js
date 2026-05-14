import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Favorites({ user, favorites, onToggleFavorite, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/favorites`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => setItems(r.data.favorites))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <button className="back-btn" onClick={onBack}>← Назад</button>
        <h2>Избранное</h2>
      </div>
      {loading && <div className="loading">Загрузка...</div>}
      {!loading && !items.length && (
        <div className="empty-favorites">
          <p>Вы ещё не добавили ничего в избранное.</p>
          <p>Нажмите ☆ на карточке товара, чтобы сохранить его здесь.</p>
        </div>
      )}
      <div className="results-grid">
        {items.map(item =>
          <ProductCard key={item.id} item={item} isFav={true} onToggle={onToggleFavorite} />
        )}
      </div>
    </div>
  );
}
