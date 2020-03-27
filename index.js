import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import MyHeadlessTask from './MyHeadlessTask'
import { name as appName } from './app.json';

AppRegistry.registerHeadlessTask('Heartbeat', () => MyHeadlessTask);
AppRegistry.registerComponent('Notify', () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('Notify', { rootTag });
}
