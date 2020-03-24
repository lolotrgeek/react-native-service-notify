import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import { Provider } from 'react-redux';
import App from './App';
import { name as appName } from './app.json';
import { setHeartBeat, store } from './store';

const MyHeadlessTask = async () => {
  console.log('Receiving HeartBeat!');
  return 1
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
