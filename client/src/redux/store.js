
import { persistStore, persistReducer } from 'redux-persist';
import storageSession from 'redux-persist/lib/storage/session';import { createStore, applyMiddleware, compose } from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './rootReducer.js';

const persistConfig = {
  key: 'root',
  storage: storageSession,
  whitelist: ['user', 'auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.({
    trace: true,
    traceLimit: 25,
  }) || compose;

export const store = createStore(
  persistedReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export const persistor = persistStore(store);


