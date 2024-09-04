import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css';

ReactDOM.createRoot(document.querySelector('body')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
