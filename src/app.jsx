import React from 'react';
import { createRoot } from 'react-dom/client';
import { Root } from './layout/root.jsx';
import 'normalize.css';
import './index.css';
import './i18n/config.js';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);

  root.render(<Root />);
}
