import React from 'react';
import ReactDOM from 'react-dom/client';

import MarkmapHooks from './markmap-hooks';
import './style.css';

function App() {
  return (
    <div className="flex flex-col h-screen p-2">
      <MarkmapHooks />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
