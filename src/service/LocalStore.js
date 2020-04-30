import { createStore, combineReducers } from 'redux';
import { createAction, handleActions } from 'redux-actions';

const appInitialState = {
  heartBeat: 0,
  project: [],
  timer: [],
  status: ''
};

const SET_HEART_BEAT = 'SET_HEART_BEAT';
const SET_PROJECT = 'SET_PROJECT';
const SET_TIMER = 'SET_TIMER';
const SET_STATUS = 'SET_STATUS';
export const setHeartBeat = createAction(SET_HEART_BEAT);
export const setProject = createAction(SET_PROJECT);
export const setTimer = createAction(SET_TIMER);
export const setStatus = createAction(SET_STATUS);

const App = handleActions(
  {
    [SET_HEART_BEAT]: (state, { payload }) => ({
      ...state,
      heartBeat: payload,
    }),
    [SET_PROJECT]: (state, { payload }) => ({
      ...state,
      project: payload,
    }),
    [SET_TIMER]: (state, { payload }) => ({
      ...state,
      timer: payload,
    }),    
    [SET_STATUS]: (state, { payload }) => ({
      ...state,
      status: payload,
    }),
  },
  appInitialState,
);

const rootReducer = combineReducers({
  App,
});

const configureStore = () => createStore(rootReducer);
export const store = configureStore();