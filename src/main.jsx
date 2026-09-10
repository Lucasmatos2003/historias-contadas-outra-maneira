import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../assets/css/style.css';
import './responsive.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
