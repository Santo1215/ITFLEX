// index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/App.css';
import { BalanceProvider } from './context/BalanceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BalanceProvider>
      <App />
    </BalanceProvider>
  </React.StrictMode>
);
