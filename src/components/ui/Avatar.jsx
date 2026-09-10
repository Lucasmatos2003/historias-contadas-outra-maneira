import React from 'react';

export function Avatar({ name, photoURL, className = 'profile-avatar' }) {
  return (
    <div className={className}>
      {photoURL ? <img src={photoURL} alt="" /> : (name || 'P').slice(0, 1).toUpperCase()}
    </div>
  );
}
