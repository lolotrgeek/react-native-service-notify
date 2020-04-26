import React from 'react';
import { AppRegistry, Platform } from 'react-native';
import App from './src/App';
import CountTask from './src/CountTask'
import DataTask from './src/DataTask'
import { name as appName } from './src/app.json';

AppRegistry.registerHeadlessTask('Heartbeat', () => CountTask);
AppRegistry.registerHeadlessTask('Data', () => DataTask);
AppRegistry.registerComponent('Notify', () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication('Notify', { rootTag });
}
