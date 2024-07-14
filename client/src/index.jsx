import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import './index.css'
import store from './redux/store.js';
import { BrowserRouter as Router } from 'react-router-dom';
import 'typeface-varela-round';
import { Provider } from 'react-redux';


ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>
)
