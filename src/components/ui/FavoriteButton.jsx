import React, { useState } from 'react';

export function FavoriteButton({ slug }) {
  const [favorite, setFavorite] = useState(() => JSON.parse(localStorage.getItem('favorites') || '[]').includes(slug));

  const toggle = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const next = favorite ? favorites.filter((item) => item !== slug) : [...favorites, slug];
    localStorage.setItem('favorites', JSON.stringify(next));
    setFavorite(!favorite);
  };

  return (
    <button
      className={`save-button ${favorite ? 'is-favorite' : ''}`}
      aria-pressed={favorite}
      onClick={toggle}
      type="button"
    >
      {favorite ? '★ Salvo' : '☆ Salvar'}
    </button>
  );
}
