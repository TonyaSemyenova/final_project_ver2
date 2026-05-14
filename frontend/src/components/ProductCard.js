export default function ProductCard({ item, isFav, onToggle }) {
  return (
    <div className="product-card">
      {item.image_url && <img src={item.image_url} alt={item.name} className="product-image" />}
      <div className="product-info">
        <h3>{item.name}</h3>
        {item.price && <p className="price">{item.price.toLocaleString()} ₽</p>}
        <div style={{ fontSize: '0.9rem', color: '#999', marginBottom: '1rem' }}>
          {item.width && item.length && item.height &&
            <p>Размеры: {item.width}×{item.length}×{item.height} см</p>}
          {item.style && <p>Стиль: {item.style}</p>}
          {item.brand && <p>Бренд: {item.brand}</p>}
        </div>
        <div className="card-actions">
          <a href={item.product_url} target="_blank" rel="noopener noreferrer" className="buy-btn">
            Перейти в магазин
          </a>
          <button className={`favorite-btn${isFav ? ' active' : ''}`} onClick={() => onToggle(item.id)}
            title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}>
            {isFav ? '★' : '☆'}
          </button>
        </div>
      </div>
    </div>
  );
}
