


import { createStore, applyMiddleware, compose  } from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './rootReducer.js'


const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?.({
    trace: true,
    traceLimit: 25,
  }) || compose;

const store = createStore(
  rootReducer,  
  composeEnhancers(applyMiddleware(thunk)) // Applying middleware and dev tools
);

export default store;