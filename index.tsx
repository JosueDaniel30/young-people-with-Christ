
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Registro del Service Worker mejorado para evitar problemas de origen cruzado
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Usamos el nombre del archivo directamente para que el navegador resuelva la ruta relativa al documento
    const swPath = 'sw.js';
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('Ignite SW activo en:', registration.scope);
      })
      .catch((error) => {
        // Silenciamos el error en el entorno de previsualización de AI Studio si es por origen cruzado
        if (!error.message.includes('origin')) {
          console.warn('Error en registro de SW:', error.message);
        }
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
