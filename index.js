import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { Provider } from 'react-redux';
import App from './App';
import { name as appName } from './app.json';
import Heartbeat from './Heartbeat';
import { setHeartBeat, store } from './store';

const MyHeadlessTask = async () => {
  console.log('Receiving HeartBeat!');
  let state = store.getState()
  if (state.App.heartBeat === false) { store.dispatch(setHeartBeat(0)); }
  else {
    store.dispatch(setHeartBeat(state.App.heartBeat + 1));
    let tick = state.App.heartBeat
    Heartbeat.notificationUpdate(tick.toString())
  }
  
  console.log('State: ', state.App.heartBeat, typeof state.App.heartBeat)

};


const RNRedux = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

AppRegistry.registerHeadlessTask('Heartbeat', () => MyHeadlessTask);
// AppRegistry.registerComponent('Notify', () => App);
AppRegistry.registerComponent(appName, () => RNRedux);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('Notify', { rootTag });
}
