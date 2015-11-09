import css from './index.css';

import React from 'react';

import App from './components/App';

if (typeof document !== 'undefined') {
  React.render(<App className={css.main}/>, document.getElementById('root'));
}

export default App;
