import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../styles/global.css';

const splash = document.getElementById('splash-screen');
const hideSplash = () => {
  if (splash) {
    splash.classList.add('hidden');
    setTimeout(() => splash.remove(), 300);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
    <App />
    </Suspense>
  </React.StrictMode>
);

hideSplash();
