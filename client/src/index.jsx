import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.jsx'
import './index.css'
import {store, persistor} from './redux/store.js';
import { BrowserRouter as Router } from 'react-router-dom';
import 'typeface-varela-round';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import LoadingSpinner from './components/LoadingSpinner.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </Router>
)
