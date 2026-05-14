import ProductCard from './ProductCard';

export default function Results({ results, favorites = [], onToggleFavorite }) {
  if (!results?.length) return null;
  return (
    <div className="results">
      <h2>Найдено товаров: {results.length}</h2>
      <div className="results-grid">
        {results.map(item =>
          <ProductCard key={item.id} item={item}
            isFav={favorites.includes(Number(item.id))} onToggle={onToggleFavorite} />
        )}
      </div>
    </div>
  );
}
